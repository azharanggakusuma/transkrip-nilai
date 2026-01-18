"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { OfficialFormValues, Lecturer, StudyProgram } from "@/lib/types";
import { Loader2, Upload } from "lucide-react";
import Image from "next/image";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
import { getActiveLecturers } from "@/app/actions/lecturers";
import { getStudyPrograms } from "@/app/actions/students";

interface OfficialFormProps {
  initialData?: OfficialFormValues;
  onSubmit: (data: OfficialFormValues, formData: FormData) => void; 
  onCancel: () => void;
  isEditing: boolean;
}

const defaultValues: OfficialFormValues = {
  jabatan: "",
  is_active: true,
  lecturer_id: "",
  study_program_id: null,
};

export default function OfficialForm({
  initialData,
  onSubmit,
  onCancel,
  isEditing
}: OfficialFormProps) {
  const [loading, setLoading] = useState(false);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  
  // -- FORM STATE --
  const [formData, setFormData] = useState<OfficialFormValues>(() => {
    if (initialData) return { ...initialData };
    return { ...defaultValues };
  });

  const [previewBasah, setPreviewBasah] = useState<string | null>(null);
  const [previewDigital, setPreviewDigital] = useState<string | null>(null);

  // Jabatan Selector State
  const [jabatanMode, setJabatanMode] = useState<string>(() => {
      if (initialData?.jabatan === "Ketua STMIK IKMI Cirebon") return "ketua";
      if (initialData?.jabatan?.startsWith("Ketua Program Studi")) return "kaprodi";
      return "manual";
  });

  // Load Reference Data
  useEffect(() => {
    const loadData = async () => {
        try {
            const [lecturerData, prodiData] = await Promise.all([
                getActiveLecturers(),
                getStudyPrograms()
            ]);
            setLecturers(lecturerData);
            setStudyPrograms(prodiData);
        } catch(e) {
            console.error(e);
        }
    }
    loadData();
  }, []);

  // Sync Initial Data (Optional if key is used, but good for safety)
  useEffect(() => {
    if (initialData) {
      setFormData({
        jabatan: initialData.jabatan || "",
        is_active: initialData.is_active ?? true,
        lecturer_id: initialData.lecturer_id || "",
        study_program_id: initialData.study_program_id || null,
      });

      setPreviewBasah(initialData.ttd_basah_url || null);
      setPreviewDigital(initialData.ttd_digital_url || null);

      // Determine Jabatan Mode
      if (initialData.jabatan === "Ketua STMIK IKMI Cirebon") {
          setJabatanMode("ketua");
      } else if (initialData.jabatan?.startsWith("Ketua Program Studi")) {
          setJabatanMode("kaprodi");
      } else {
          setJabatanMode("manual");
      }
    }
  }, [initialData]);

  // Handle Input Changes
  const handleInputChange = (field: keyof OfficialFormValues, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Jabatan Mode Change
  const handleJabatanModeChange = (mode: string) => {
    setJabatanMode(mode);
    if (mode === "ketua") {
        setFormData(prev => ({ ...prev, jabatan: "Ketua STMIK IKMI Cirebon", study_program_id: null }));
    } else if (mode === "kaprodi") {
        setFormData(prev => ({ ...prev, jabatan: "" })); // Reset until prodi selected
    } else {
        setFormData(prev => ({ ...prev, jabatan: "", study_program_id: null })); // Manual input
    }
  };

  // Handle Prodi Change (for Kaprodi)
  const handleProdiChange = (prodiId: string) => {
    const prodi = studyPrograms.find(p => p.id === prodiId);
    let newJabatan = formData.jabatan;
    
    if (prodi) {
        newJabatan = `Ketua Program Studi ${prodi.nama}`;
    }

    setFormData(prev => ({
        ...prev,
        study_program_id: prodiId,
        jabatan: newJabatan
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'basah' | 'digital') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      if (type === 'basah') setPreviewBasah(url);
      else setPreviewDigital(url);
    }
  };

  // Derived state for display
  const selectedLecturer = lecturers.find(l => l.id === formData.lecturer_id);
  const displayNama = selectedLecturer?.nama || "-";
  const displayNidn = selectedLecturer?.nidn || "-";

  const onFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append("jabatan", formData.jabatan);
      dataPayload.append("is_active", String(formData.is_active));
      if (formData.lecturer_id) dataPayload.append("lecturer_id", formData.lecturer_id);
      if (formData.study_program_id) dataPayload.append("study_program_id", formData.study_program_id);

      const fileInputBasah = document.getElementById("file_basah") as HTMLInputElement;
      const fileInputDigital = document.getElementById("file_digital") as HTMLInputElement;

      if (fileInputBasah?.files?.[0]) {
        dataPayload.append("file_basah", fileInputBasah.files[0]);
      }
      if (fileInputDigital?.files?.[0]) {
        dataPayload.append("file_digital", fileInputDigital.files[0]);
      }
      
      onSubmit(formData, dataPayload);
      
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={onFormSubmit} className="space-y-6 py-4">
      <div className="space-y-4">
        
        {/* Pilih Dosen (Wajib) */}
        <div className="space-y-2">
            <Label>Pilih Dosen <span className="text-red-500">*</span></Label>
            <Select 
                onValueChange={(val) => handleInputChange("lecturer_id", val)} 
                value={formData.lecturer_id}
                required
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="-- Pilih Dosen dari Data Dosen --" />
                </SelectTrigger>
                <SelectContent>
                    {lecturers.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.nama}</SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <p className="text-[10px] text-muted-foreground">
               Pejabat wajib dipilih dari data dosen yang terdaftar.
            </p>
        </div>

        {/* Display Read-Only Name/NIDN */}
        <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">Nama Lengkap</Label>
                <div className="bg-slate-100 p-2 rounded text-sm text-slate-700 font-medium min-h-[36px] flex items-center">
                    {displayNama}
                </div>
             </div>
             <div className="space-y-2">
                <Label className="text-muted-foreground text-xs">NIDN</Label>
                <div className="bg-slate-100 p-2 rounded text-sm text-slate-700 font-medium min-h-[36px] flex items-center">
                    {displayNidn}
                </div>
             </div>
        </div>

        {/* Jabatan Selector */}
        <div className="border border-slate-200 rounded-lg p-4 space-y-4 bg-slate-50/50">
            <div className="space-y-2">
                <Label>Jabatan</Label>
                <Select onValueChange={handleJabatanModeChange} value={jabatanMode}>
                    <SelectTrigger className="w-full">
                         <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="ketua">Ketua STMIK IKMI Cirebon</SelectItem>
                        <SelectItem value="kaprodi">Ketua Program Studi (Kaprodi)</SelectItem>
                        <SelectItem value="manual">Lainnya (Input Manual)</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* If Kaprodi, show Prodi Selector */}
            {jabatanMode === "kaprodi" && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                     <Label>Pilih Program Studi <span className="text-red-500">*</span></Label>
                     <Select 
                        onValueChange={handleProdiChange}
                        value={formData.study_program_id || ""}
                     >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="-- Pilih Prodi --" />
                        </SelectTrigger>
                        <SelectContent>
                            {studyPrograms.map(p => (
                                <SelectItem key={p.id} value={p.id}>{p.nama} ({p.jenjang})</SelectItem>
                            ))}
                        </SelectContent>
                     </Select>
                </div>
            )}

            {/* If Manual, show Text Input */}
            {jabatanMode === "manual" && (
                 <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="jabatan_manual">Nama Jabatan <span className="text-red-500">*</span></Label>
                    <Input 
                        id="jabatan_manual"
                        placeholder="Contoh: Wakil Ketua I" 
                        value={formData.jabatan}
                        onChange={(e) => handleInputChange("jabatan", e.target.value)}
                        required={jabatanMode === "manual"}
                    />
                 </div>
            )}

             {/* Readonly preview for generated jabatan */}
             {jabatanMode !== "manual" && (
                <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Jabatan Terpilih:</Label>
                    <p className="text-sm font-semibold text-primary">{formData.jabatan || "-"}</p>
                </div>
             )}
        </div>


        {/* Input Tanda Tangan Basah */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Tanda Tangan Basah
                </Label>
                <Input
                    id="file_basah"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'basah')}
                />
                
                {previewBasah && (
                    <div className="mt-2 w-full h-32 relative border-2 border-dashed rounded-md bg-white flex items-center justify-center overflow-hidden">
                        <Image 
                            src={previewBasah} 
                            alt="Preview Basah" 
                            fill 
                            className="object-contain" 
                        />
                    </div>
                )}
            </div>

            {/* Input Tanda Tangan Digital */}
            <div className="space-y-2 border rounded-lg p-4 bg-white shadow-sm">
                <Label className="flex items-center gap-2">
                    <Upload className="w-4 h-4" /> Tanda Tangan Digital
                </Label>
                <Input
                    id="file_digital"
                    type="file"
                    accept="image/*"
                      className="cursor-pointer"
                    onChange={(e) => handleFileChange(e, 'digital')}
                />
                
                  {previewDigital && (
                    <div className="mt-2 w-full h-32 relative border-2 border-dashed rounded-md bg-white flex items-center justify-center overflow-hidden">
                        <Image 
                            src={previewDigital} 
                            alt="Preview Digital" 
                            fill 
                            className="object-contain" 
                        />
                    </div>
                )}
            </div>
        </div>

        {/* Switch Active */}
        <div className="flex items-center justify-between space-x-2 border p-3 rounded-md bg-white shadow-sm">
          <Label htmlFor="is_active" className="cursor-pointer font-medium">
            Status Pejabat Aktif?
          </Label>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => handleInputChange("is_active", checked)}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Simpan Pejabat"}
        </Button>
      </div>
    </form>
  );
}
