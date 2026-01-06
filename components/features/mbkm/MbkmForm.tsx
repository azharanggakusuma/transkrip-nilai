"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { toast } from "sonner";
import { StudentMBKMFormValues, StudentData, AcademicYear } from "@/lib/types";

interface MbkmFormProps {
  initialData?: StudentMBKMFormValues;
  students: StudentData[];
  academicYears: AcademicYear[];
  isEditing: boolean;
  onSubmit: (data: StudentMBKMFormValues) => void;
  onCancel: () => void;
}

const defaultValues: StudentMBKMFormValues = {
  student_id: "",
  academic_year_id: "",
  jenis_mbkm: "",
  mitra: "",
  keterangan: ""
};

const JENIS_MBKM = [
  "Magang Bersertifikat",
  "Studi Independen",
  "Kampus Mengajar",
  "Pertukaran Mahasiswa Merdeka",
  "Wirausaha Merdeka",
  "Penelitian / Riset",
  "Proyek Kemanusiaan",
  "KKN Tematik"
];

export function MbkmForm({ 
  initialData, 
  students, 
  academicYears, 
  isEditing, 
  onSubmit, 
  onCancel 
}: MbkmFormProps) {

  const [formData, setFormData] = useState<StudentMBKMFormValues>(initialData || defaultValues);
  const [openStudent, setOpenStudent] = useState(false); 

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = [];
    if (!formData.student_id) errors.push("Mahasiswa wajib dipilih.");
    if (!formData.academic_year_id) errors.push("Periode Akademik wajib dipilih.");
    if (!formData.jenis_mbkm) errors.push("Jenis MBKM wajib dipilih.");
    if (!formData.mitra.trim()) errors.push("Nama Mitra wajib diisi.");

    if (errors.length > 0) {
      toast.error("Validasi Gagal", {
        description: <ul className="list-disc pl-4">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
      });
      return;
    }

    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      
      {/* SECTION 1: DATA UTAMA */}
      <div className="space-y-4">
        
        {/* Input Mahasiswa (Searchable Combobox) */}
        <div className="flex flex-col gap-2">
          <Label>
            Mahasiswa {isEditing && "(Tidak dapat diubah)"} <span className="text-red-500">*</span>
          </Label>
          
          <Popover open={openStudent} onOpenChange={setOpenStudent}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openStudent}
                className={cn(
                  "w-full justify-between font-normal",
                  !formData.student_id && "text-muted-foreground"
                )}
                disabled={isEditing}
              >
                {formData.student_id
                  ? (() => {
                      const s = students.find((student) => student.id === formData.student_id);
                      return s ? `${s.profile.nim} - ${s.profile.nama}` : "Mahasiswa tidak ditemukan";
                    })()
                  : "Cari Mahasiswa (NIM / Nama)..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[400px] p-0" align="start">
              <Command>
                <CommandInput placeholder="Cari NIM atau Nama..." />
                <CommandList>
                  <CommandEmpty>Mahasiswa tidak ditemukan.</CommandEmpty>
                  <CommandGroup>
                    {students.map((student) => (
                      <CommandItem
                        key={student.id}
                        value={`${student.profile.nim} ${student.profile.nama}`} 
                        onSelect={() => {
                          setFormData({ ...formData, student_id: student.id });
                          setOpenStudent(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            formData.student_id === student.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span className="font-medium">{student.profile.nama}</span>
                          <span className="text-xs text-muted-foreground">NIM: {student.profile.nim}</span>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Grid Layout: Periode & Jenis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Periode Akademik */}
          <div className="flex flex-col gap-2">
            <Label>Periode Akademik <span className="text-red-500">*</span></Label>
            <Select 
                value={formData.academic_year_id} 
                onValueChange={(val) => setFormData({...formData, academic_year_id: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Periode" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map((ay) => (
                  <SelectItem key={ay.id} value={ay.id}>
                    {ay.nama} - {ay.semester} {ay.is_active ? "(Aktif)" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Jenis MBKM */}
          <div className="flex flex-col gap-2">
            <Label>Jenis Program <span className="text-red-500">*</span></Label>
            <Select 
                value={formData.jenis_mbkm} 
                onValueChange={(val) => setFormData({...formData, jenis_mbkm: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih Jenis Program" />
              </SelectTrigger>
              <SelectContent>
                {JENIS_MBKM.map((j) => (
                  <SelectItem key={j} value={j}>{j}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* SECTION 2: DETAIL MITRA */}
      <div className="space-y-4 pt-2 border-t">
        <div className="flex flex-col gap-2">
          <Label>Nama Mitra <span className="text-red-500">*</span></Label>
          <Input 
            value={formData.mitra}
            onChange={(e) => setFormData({...formData, mitra: e.target.value})}
            placeholder="Contoh: PT. Telkom Indonesia, Tbk"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label>Keterangan Tambahan</Label>
          <Textarea 
            value={formData.keterangan}
            onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
            placeholder="Tuliskan detail durasi, posisi, atau catatan penting lainnya..."
            className="min-h-[80px]"
          />
        </div>
      </div>

      {/* FOOTER ACTIONS */}
      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Batal</Button>
        <Button type="submit" className="min-w-[120px]">Simpan Data</Button>
      </div>
    </form>
  );
}