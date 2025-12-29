// components/features/nilai/StudentGradeForm.tsx
"use client";

import React, { useState } from "react";
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
  
  // State untuk menyimpan perubahan nilai: { [courseId]: "A" }
  const [gradeChanges, setGradeChanges] = useState<Record<number, string>>({});

  // Gabungkan nilai yang sudah ada (dari student.transcript) dengan perubahan baru
  const getGradeValue = (courseId: number) => {
    // Cek apakah ada di state perubahan
    if (gradeChanges[courseId] !== undefined) {
      return gradeChanges[courseId];
    }
    // Jika tidak, cek dari data transcript mahasiswa
    const existing = student.transcript.find((t) => t.course_id === courseId);
    return existing ? existing.hm : "";
  };

  const handleGradeChange = (courseId: number, value: string) => {
    setGradeChanges((prev) => ({
      ...prev,
      [courseId]: value,
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Siapkan payload: hanya kirim item yang ada di gradeChanges
      const payload = Object.entries(gradeChanges).map(([cId, hm]) => ({
        course_id: parseInt(cId),
        hm: hm,
      }));

      if (payload.length === 0) {
        toast.info("Tidak ada perubahan nilai yang disimpan.");
        onCancel();
        return;
      }

      await onSubmit(parseInt(student.id), payload);
      toast.success("Nilai berhasil disimpan!");
      onCancel();
    } catch (error) {
      toast.error("Gagal menyimpan nilai.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Group Courses by Semester
  // Filter: Hanya tampilkan semester 1 sampai semester mahasiswa saat ini
  const maxSemester = student.profile.semester;
  
  // Buat array semester yang relevan [1, 2, ..., maxSemester]
  const relevantSemesters = Array.from({ length: maxSemester }, (_, i) => i + 1);

  return (
    <div className="flex flex-col h-[60vh]">
      {/* Header Info Mahasiswa */}
      <div className="bg-slate-50 p-4 border-b mb-2 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg text-slate-800">{student.profile.nama}</h3>
            <p className="text-sm text-slate-500 font-mono">{student.profile.nim}</p>
          </div>
          <Badge variant="secondary">Semester {student.profile.semester}</Badge>
        </div>
        <p className="text-xs text-slate-400 mt-1">{student.profile.prodi}</p>
      </div>

      {/* Konten Scrollable: Daftar Matkul per Semester */}
      <div className="flex-1 overflow-y-auto px-1 pr-2">
        <Accordion type="multiple" defaultValue={relevantSemesters.map(String)} className="w-full">
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
                    {coursesInSmt.map((course) => (
                      <div
                        key={course.id}
                        className="flex items-center justify-between bg-white p-3 rounded border shadow-sm"
                      >
                        <div className="flex-1 mr-4">
                          <p className="font-medium text-sm text-slate-700">
                            {course.matkul}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {course.kode} • {course.sks} SKS
                          </p>
                        </div>
                        <div className="w-[80px]">
                          <Select
                            value={getGradeValue(course.id)}
                            onValueChange={(val) => handleGradeChange(course.id, val)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="-" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="A-">A-</SelectItem>
                              <SelectItem value="B+">B+</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="B-">B-</SelectItem>
                              <SelectItem value="C+">C+</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    ))}
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
        <Button onClick={handleSave} disabled={loading}>
          {loading ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>
    </div>
  );
}