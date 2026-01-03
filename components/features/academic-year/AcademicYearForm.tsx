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
import { Switch } from "@/components/ui/switch"; // Pastikan komponen Switch ada/install shadcn switch
import { Loader2 } from "lucide-react";
import { AcademicYearFormValues } from "@/lib/types";
import { useToastMessage } from "@/hooks/use-toast-message";

interface AcademicYearFormProps {
  initialData?: AcademicYearFormValues;
  isEditing: boolean;
  isLoading?: boolean;
  onSubmit: (data: AcademicYearFormValues) => void;
  onCancel: () => void;
}

const defaultValues: AcademicYearFormValues = {
  nama: "", semester: "", is_active: false
};

export function AcademicYearForm({ initialData, isEditing, isLoading = false, onSubmit, onCancel }: AcademicYearFormProps) {
  const { showError } = useToastMessage();

  const parseInitialData = (data?: AcademicYearFormValues): AcademicYearFormValues => {
    if (!data) return defaultValues;
    return {
      nama: data.nama || "",
      semester: data.semester || "",
      is_active: data.is_active || false
    };
  };

  const [formData, setFormData] = useState<AcademicYearFormValues>(() => parseInitialData(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof AcademicYearFormValues, boolean>>>({});

  useEffect(() => {
    setFormData(parseInitialData(initialData));
  }, [initialData]);

  const handleInputChange = (field: keyof AcademicYearFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof AcademicYearFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    if (!formData.nama) {
      newErrors.nama = true;
      errorMessages.push("Nama Tahun Akademik wajib diisi.");
    }
    // Validasi format sederhana (opsional, misal harus ada tanda /)
    if (formData.nama && !formData.nama.includes("/")) {
        // newErrors.nama = true;
        // errorMessages.push("Format Tahun Akademik disarankan YYYY/YYYY.");
    }

    if (!formData.semester) {
      newErrors.semester = true;
      errorMessages.push("Semester wajib dipilih.");
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

  const errorClass = (field: keyof AcademicYearFormValues) => 
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      
      {/* Nama Tahun Akademik */}
      <div className="grid gap-2">
        <Label htmlFor="nama">
          Tahun Akademik <span className="text-red-500">*</span>
        </Label>
        <Input 
          id="nama" 
          value={formData.nama} 
          onChange={(e) => handleInputChange("nama", e.target.value)} 
          placeholder="Contoh: 2023/2024" 
          className={errorClass("nama")}
        />
      </div>

      {/* Semester */}
      <div className="grid gap-2">
        <Label htmlFor="semester">
          Semester <span className="text-red-500">*</span>
        </Label>
        <Select 
          value={formData.semester} 
          onValueChange={(val) => handleInputChange("semester", val)}
        >
          <SelectTrigger className={`w-full ${errorClass("semester")}`}>
            <SelectValue placeholder="Pilih Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Ganjil">Ganjil</SelectItem>
            <SelectItem value="Genap">Genap</SelectItem>
            <SelectItem value="Pendek">Pendek (Antara)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Status Aktif */}
      <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
        <div className="space-y-0.5">
          <Label className="text-base">Status Aktif</Label>
          <p className="text-sm text-muted-foreground">
            Jadikan sebagai tahun akademik yang sedang berjalan.
          </p>
        </div>
        <Switch 
          checked={formData.is_active}
          onCheckedChange={(checked) => handleInputChange("is_active", checked)}
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Buat Tahun Akademik"}
        </Button>
      </div>
    </form>
  );
}