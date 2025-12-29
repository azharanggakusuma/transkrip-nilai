// components/features/nilai/StudentGradeForm.tsx
"use client";

import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StudentData } from "@/lib/types";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal"; // Import Modal Konfirmasi

interface CourseRaw {
  id: number;
  kode: string;
  matkul: string;
  sks: number;
  smt_default: number;
}

interface StudentGradeFormProps {
  student: StudentData;
  allCourses: CourseRaw[];
  onSubmit: (studentId: number, grades: { course_id: number; hm: string }[]) => Promise<void>;
  onCancel: () => void;
}

export function StudentGradeForm({
  student,
  allCourses,
  onSubmit,
  onCancel,
}: StudentGradeFormProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false); // State untuk modal konfirmasi
  
  // State untuk menyimpan perubahan nilai: { [courseId]: "A" }
  const [gradeChanges, setGradeChanges] = useState<Record<number, string>>({});

  // Helper: Ambil nilai saat ini (dari state perubahan ATAU transcript asli)
  const getGradeValue = (courseId: number) => {
    if (gradeChanges[courseId] !== undefined) {
      return gradeChanges[courseId];
    }
    const existing = student.transcript.find((t) => t.course_id === courseId);
    return existing ? existing.hm : "";
  };

  // Helper: Konversi Huruf Mutu ke Angka Mutu untuk hitung IPK
  const getGradePoint = (hm: string) => {
    switch (hm) {
      case "A": return 4;
      case "B": return 3;
      case "C": return 2;
      case "D": return 1;
      case "E": return 0;
      default: return 0;
    }
  };

  const handleGradeChange = (courseId: number, value: string) => {
    setGradeChanges((prev) => ({
      ...prev,
      [courseId]: value,
    }));
  };

  // Poin 3: Otomatisasi IPK/IPS (Real-time Calculation)
  // Menghitung IPK berdasarkan nilai yang sedang diedit
  const projectedStats = useMemo(() => {
    const maxSemester = student.profile.semester;
    // Ambil semua matkul yang relevan (semester 1 s.d. saat ini)
    const relevantCourses = allCourses.filter(c => c.smt_default <= maxSemester);
    
    let totalSks = 0;
    let totalPoints = 0;

    relevantCourses.forEach(course => {
      // Ambil nilai (prioritaskan yang sedang diedit)
      const hm = getGradeValue(course.id);
      
      // Hanya hitung jika ada nilai valid (A-E)
      if (hm && ["A", "B", "C", "D", "E"].includes(hm)) {
        const point = getGradePoint(hm);
        totalSks += course.sks;
        totalPoints += (course.sks * point);
      }
    });

    const ipk = totalSks === 0 ? 0 : totalPoints / totalSks;
    return {
      ipk: ipk.toFixed(2),
      totalSks
    };
  }, [allCourses, gradeChanges, student.transcript, student.profile.semester]);

  // Handler tombol simpan (membuka modal)
  const onSaveClick = () => {
    const changesCount = Object.keys(gradeChanges).length;
    if (changesCount === 0) {
      toast.info("Tidak ada perubahan nilai yang disimpan.");
      onCancel();
      return;
    }
    setShowConfirm(true); // Buka modal konfirmasi
  };

  // Handler eksekusi simpan (setelah konfirmasi)
  const handleConfirmSave = async () => {
    setLoading(true);
    try {
      const payload = Object.entries(gradeChanges).map(([cId, hm]) => ({
        course_id: parseInt(cId),
        hm: hm,
      }));

      await onSubmit(parseInt(student.id), payload);
      toast.success("Nilai berhasil disimpan!");
      onCancel();
    } catch (error) {
      toast.error("Gagal menyimpan nilai.");
      console.error(error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  // Setup Semester
  const maxSemester = student.profile.semester;
  const relevantSemesters = Array.from({ length: maxSemester }, (_, i) => i + 1);

  // Poin 4: Default Accordion yang Lebih Rapi
  // Hanya membuka semester terakhir (semester aktif) secara default
  const defaultAccordionValue = [String(maxSemester)];

  return (
    <>
      <div className="flex flex-col h-[60vh]">
        {/* Header Info Mahasiswa */}
        <div className="bg-slate-50 p-4 border-b mb-2 rounded-t-lg">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-lg text-slate-800">{student.profile.nama}</h3>
              <p className="text-sm text-slate-500 font-mono">{student.profile.nim}</p>
            </div>
            
            <div className="flex flex-col items-end gap-1">
              <Badge variant="secondary">Semester {student.profile.semester}</Badge>
              
              {/* Tampilan Proyeksi IPK */}
              <div className="flex items-center gap-2 mt-1 bg-white px-2 py-1 rounded border shadow-sm">
                <span className="text-xs text-slate-500">Proyeksi IPK:</span>
                <span className={`text-sm font-bold ${
                  Number(projectedStats.ipk) < 3.0 ? "text-red-600" : "text-green-600"
                }`}>
                  {projectedStats.ipk}
                </span>
                <span className="text-[10px] text-slate-400">({projectedStats.totalSks} SKS)</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-1">{student.profile.prodi}</p>
        </div>

        {/* Konten Scrollable: Daftar Matkul per Semester */}
        <div className="flex-1 overflow-y-auto px-1 pr-2">
          {/* Poin 4: Menggunakan defaultAccordionValue agar lebih rapi */}
          <Accordion type="multiple" defaultValue={defaultAccordionValue} className="w-full">
            {relevantSemesters.map((smt) => {
              const coursesInSmt = allCourses.filter((c) => c.smt_default === smt);
              if (coursesInSmt.length === 0) return null;

              return (
                <AccordionItem key={smt} value={String(smt)}>
                  <AccordionTrigger className="hover:no-underline py-3 px-2 bg-white hover:bg-slate-50 border-b">
                    <span className="font-semibold text-sm">Semester {smt}</span>
                  </AccordionTrigger>
                  <AccordionContent className="p-0">
                    <div className="grid grid-cols-1 gap-2 p-2 bg-slate-50/50">
                      {coursesInSmt.map((course) => {
                        // Poin 1: Indikator Visual Perubahan
                        const currentValue = getGradeValue(course.id);
                        const originalValue = student.transcript.find((t) => t.course_id === course.id)?.hm || "";
                        const isModified = gradeChanges[course.id] !== undefined && gradeChanges[course.id] !== originalValue;

                        return (
                          <div
                            key={course.id}
                            className={`flex items-center justify-between p-3 rounded border shadow-sm transition-colors ${
                              isModified ? "bg-yellow-50 border-yellow-300" : "bg-white"
                            }`}
                          >
                            <div className="flex-1 mr-4">
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-slate-700">
                                  {course.matkul}
                                </p>
                                {isModified && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-yellow-200 text-yellow-800 rounded-full font-bold">
                                    DIUBAH
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400">
                                {course.kode} • {course.sks} SKS
                              </p>
                            </div>
                            <div className="w-[80px]">
                              <Select
                                value={currentValue}
                                onValueChange={(val) => handleGradeChange(course.id, val)}
                              >
                                <SelectTrigger 
                                  className={`h-8 text-xs ${isModified ? "border-yellow-400 focus:ring-yellow-400" : ""}`}
                                >
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="A">A</SelectItem>
                                  <SelectItem value="B">B</SelectItem>
                                  <SelectItem value="C">C</SelectItem>
                                  <SelectItem value="D">D</SelectItem>
                                  <SelectItem value="E">E</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
        </div>

        {/* Footer Buttons */}
        <div className="border-t pt-4 mt-2 flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button onClick={onSaveClick} disabled={loading}>
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {/* Poin 2: Modal Konfirmasi */}
      <ConfirmModal 
        isOpen={showConfirm}
        onClose={setShowConfirm}
        onConfirm={handleConfirmSave}
        title="Simpan Perubahan Nilai?"
        description={`Anda akan menyimpan perubahan nilai untuk ${Object.keys(gradeChanges).length} mata kuliah. Tindakan ini akan memperbarui transkrip mahasiswa.`}
        confirmLabel="Ya, Simpan"
        cancelLabel="Batal"
      />
    </>
  );
}