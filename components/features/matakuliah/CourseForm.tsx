import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Lock, Loader2 } from "lucide-react";
import { CourseFormValues, StudyProgram } from "@/lib/types";
import { useToastMessage } from "@/hooks/use-toast-message";
import { getStudyPrograms } from "@/app/actions/prodi";

interface CourseFormProps {
  initialData?: CourseFormValues;
  isEditing: boolean;
  isLoading?: boolean;
  onSubmit: (data: CourseFormValues) => void;
  onCancel: () => void;
}

const defaultValues: CourseFormValues = {
  kode: "", matkul: "", sks: "", smt_default: "", kategori: "", study_program_ids: []
};

export function CourseForm({ initialData, isEditing, isLoading = false, onSubmit, onCancel }: CourseFormProps) {
  const { showError } = useToastMessage();
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [isFetchingProdi, setIsFetchingProdi] = useState(false);

  // Helper untuk parsing data awal
  const parseInitialData = (data?: CourseFormValues): CourseFormValues => {
    if (!data) return defaultValues;
    return {
      kode: data.kode || "",
      matkul: data.matkul || "",
      sks: data.sks ? String(data.sks) : "",
      smt_default: data.smt_default ? String(data.smt_default) : "",
      kategori: data.kategori || "",
      study_program_ids: data.study_program_ids || []
    };
  };

  const [formData, setFormData] = useState<CourseFormValues>(() => parseInitialData(initialData));
  const [errors, setErrors] = useState<Partial<Record<keyof CourseFormValues, boolean>>>({});

  // Fetch daftar program studi saat form dibuka
  useEffect(() => {
    const fetchProdi = async () => {
      setIsFetchingProdi(true);
      try {
        const data = await getStudyPrograms();
        setStudyPrograms(data || []);
      } catch (error) {
        console.error("Gagal memuat program studi:", error);
      } finally {
        setIsFetchingProdi(false);
      }
    };
    fetchProdi();
  }, []);

  // Sinkronisasi jika initialData berubah
  useEffect(() => {
    setFormData(parseInitialData(initialData));
  }, [initialData]);

  // Reset study_program_ids jika kategori berubah ke MBKM
  useEffect(() => {
    if (formData.kategori === "MBKM") {
      setFormData(prev => ({ ...prev, study_program_ids: [] }));
    }
  }, [formData.kategori]);

  const handleInputChange = (field: keyof CourseFormValues, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleNumericInput = (field: keyof CourseFormValues, value: string, maxLength: number) => {
    if (/^\d*$/.test(value) && value.length <= maxLength) {
      handleInputChange(field, value);
    }
  };

  const handleProdiToggle = (prodiId: string, checked: boolean) => {
    setFormData((prev) => {
      const currentIds = prev.study_program_ids || [];
      if (checked) {
        return { ...prev, study_program_ids: [...currentIds, prodiId] };
      } else {
        return { ...prev, study_program_ids: currentIds.filter(id => id !== prodiId) };
      }
    });
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof CourseFormValues, boolean>> = {};
    const errorMessages: string[] = [];
    let isValid = true;

    if (!formData.kode) {
      newErrors.kode = true;
      errorMessages.push("Kode MK wajib diisi.");
    }

    const sksVal = Number(formData.sks);
    if (!formData.sks || isNaN(sksVal)) {
      newErrors.sks = true;
      errorMessages.push("SKS wajib diisi angka.");
    }

    const smtVal = Number(formData.smt_default);
    if (!formData.smt_default || isNaN(smtVal) || smtVal < 1 || smtVal > 14) {
      newErrors.smt_default = true;
      errorMessages.push("Semester harus angka (1-14).");
    }

    if (!formData.matkul) {
      newErrors.matkul = true;
      errorMessages.push("Nama Mata Kuliah wajib diisi.");
    }

    if (!formData.kategori) {
      newErrors.kategori = true;
      errorMessages.push("Kategori wajib dipilih.");
    }

    // Validasi: kategori Reguler harus memilih minimal 1 prodi
    if (formData.kategori === "Reguler" && (!formData.study_program_ids || formData.study_program_ids.length === 0)) {
      newErrors.study_program_ids = true;
      errorMessages.push("Pilih minimal 1 program studi untuk kategori Reguler.");
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

  const errorClass = (field: keyof CourseFormValues) => 
    errors[field] ? "border-red-500 focus-visible:ring-red-500" : "";

  const isMBKM = formData.kategori === "MBKM";

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 py-4">
      <div className="grid grid-cols-4 gap-4">
        
        {/* Kolom Kode MK */}
        <div className="grid gap-2 col-span-2">
          <Label htmlFor="kode">Kode MK</Label>
          <div className="relative">
            <Input 
              id="kode" 
              value={formData.kode} 
              onChange={(e) => handleInputChange("kode", e.target.value)} 
              placeholder="Contoh: TKK-01" 
              className={`${errorClass("kode")} ${isEditing ? "bg-muted text-muted-foreground opacity-100 pr-8" : ""}`}
              disabled={isEditing} 
            />
            {isEditing && (
              <Lock className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            )}
          </div>
        </div>

        {/* Kolom SKS */}
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="sks">SKS</Label>
          <Input 
            id="sks" 
            value={formData.sks} 
            onChange={(e) => handleNumericInput("sks", e.target.value, 1)} 
            placeholder="0" 
            className={errorClass("sks")}
          />
        </div>

        {/* Kolom Semester */}
        <div className="grid gap-2 col-span-1">
          <Label htmlFor="smt">Semester</Label>
          <Input 
            id="smt" 
            value={formData.smt_default} 
            onChange={(e) => handleNumericInput("smt_default", e.target.value, 2)} 
            placeholder="0" 
            className={errorClass("smt_default")}
          />
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="matkul">Nama Mata Kuliah</Label>
        <Input 
          id="matkul" 
          value={formData.matkul} 
          onChange={(e) => handleInputChange("matkul", e.target.value)} 
          placeholder="Contoh: Pemrograman Web Lanjut" 
          className={errorClass("matkul")}
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="kategori">Kategori</Label>
        <Select 
          value={formData.kategori} 
          onValueChange={(val) => handleInputChange("kategori", val)}
        >
          <SelectTrigger className={`w-full ${errorClass("kategori")}`}>
            <SelectValue placeholder="Pilih Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Reguler">Reguler</SelectItem>
            <SelectItem value="MBKM">MBKM</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Multi-select Program Studi */}
      {!isMBKM && (
        <div className="grid gap-2">
          <Label className={errors.study_program_ids ? "text-red-500" : ""}>
            Program Studi
          </Label>
          <p className="text-xs text-muted-foreground -mt-1">
            Pilih program studi yang dapat mengambil mata kuliah ini
          </p>
          {isFetchingProdi ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Memuat...</span>
            </div>
          ) : (
            <div className={`grid grid-cols-2 gap-3 p-3 border rounded-md max-h-[150px] overflow-y-auto ${errors.study_program_ids ? "border-red-500" : ""}`}>
              {studyPrograms.map((prodi) => (
                <div key={prodi.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`prodi-${prodi.id}`}
                    checked={formData.study_program_ids?.includes(prodi.id) || false}
                    onCheckedChange={(checked) => handleProdiToggle(prodi.id, checked as boolean)}
                  />
                  <label
                    htmlFor={`prodi-${prodi.id}`}
                    className="text-sm font-medium leading-none cursor-pointer peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {prodi.nama} ({prodi.jenjang})
                  </label>
                </div>
              ))}
              {studyPrograms.length === 0 && (
                <p className="text-sm text-muted-foreground col-span-2">Tidak ada program studi tersedia</p>
              )}
            </div>
          )}
        </div>
      )}

      {isMBKM && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            📌 Mata kuliah MBKM tersedia untuk <strong>semua program studi</strong>
          </p>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Simpan Perubahan" : "Tambah Mata Kuliah"}
        </Button>
      </div>
    </form>
  );
}