import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Loader2 } from "lucide-react";
import { StudyProgramFormValues } from "@/lib/types";
import { useToastMessage } from "@/hooks/use-toast-message";

interface ProdiFormProps {
  initialData?: StudyProgramFormValues;
  isEditing: boolean;
  isLoading?: boolean;
  onSubmit: (data: StudyProgramFormValues) => void;
  onCancel: () => void;
}

const defaultValues: StudyProgramFormValues = {
  kode: "", nama: "", jenjang: ""
};

export function ProdiForm({ initialData, isEditing, isLoading = false, onSubmit, onCancel }: ProdiFormProps) {
  const { showError } = useToastMessage();

  // Parse data awal
  const parseInitialData = (data?: StudyProgramFormValues): StudyProgramFormValues => {
    if (!data) return defaultValues;
    return {
      kode: data.kode || "",
      nama: data.nama || "",
      jenjang: data.jenjang || ""
    };
  };

  const [formData, setFormData] = useState<StudyProgramFormValues>(() => parseInitialData(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof StudyProgramFormValues, boolean>>>({});

  useEffect(() => {
    setFormData(parseInitialData(initialData));
  }, [initialData]);

  // --- HANDLERS ---
  const handleInputChange = (field: keyof StudyProgramFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // --- VALIDASI ---
  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof StudyProgramFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    if (!formData.kode) {
      newErrors.kode = true;
      errorMessages.push("Kode Prodi wajib diisi.");
    }

    if (!formData.nama) {
      newErrors.nama = true;
      errorMessages.push("Nama Program Studi wajib diisi.");
    }

    if (!formData.jenjang) {
      newErrors.jenjang = true;
      errorMessages.push("Jenjang wajib dipilih.");
    }

    if (errorMessages.length > 0) {
      setErrors(newErrors);
      isValid = false;
      showError("Validasi Gagal", errorMessages.join(", "));
    }

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) onSubmit(formData);
  };

  const errorClass = (field: keyof StudyProgramFormValues) => 
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      <div className="grid grid-cols-4 gap-4">
        {/* Kolom Kode */}
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="kode">Kode Prodi</Label>
          <div className="relative">
            <Input 
              id="kode" 
              value={formData.kode} 
              onChange={(e) => handleInputChange("kode", e.target.value)} 
              placeholder="Contoh: TI" 
              className={`${errorClass("kode")} ${isEditing ? "bg-muted text-muted-foreground opacity-100 pr-8" : ""}`}
              disabled={isEditing} 
            />
            {isEditing && (
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Kolom Jenjang */}
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="jenjang">Jenjang</Label>
          <Select 
            value={formData.jenjang} 
            onValueChange={(val) => handleInputChange("jenjang", val)}
          >
            <SelectTrigger className={errorClass("jenjang")}>
              <SelectValue placeholder="Pilih Jenjang" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="D3">D3 - Ahli Madya</SelectItem>
              <SelectItem value="D4">D4 - Sarjana Terapan</SelectItem>
              <SelectItem value="S1">S1 - Sarjana</SelectItem>
              <SelectItem value="S2">S2 - Magister</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nama">Nama Program Studi</Label>
        <Input 
          id="nama" 
          value={formData.nama} 
          onChange={(e) => handleInputChange("nama", e.target.value)} 
          placeholder="Contoh: Teknik Informatika" 
          className={errorClass("nama")}
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Tambah Prodi"}
        </Button>
      </div>
    </form>
  );
}