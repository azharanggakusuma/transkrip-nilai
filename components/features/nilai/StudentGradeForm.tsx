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
import { Card } from "@/components/ui/card";
import { StudentData } from "@/lib/types";
import { toast } from "sonner";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Calculator, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [showConfirm, setShowConfirm] = useState(false);
  
  // State perubahan nilai
  const [gradeChanges, setGradeChanges] = useState<Record<number, string>>({});

  // --- Helpers ---

  const getGradeValue = (courseId: number) => {
    return gradeChanges[courseId] !== undefined
      ? gradeChanges[courseId]
      : student.transcript.find((t) => t.course_id === courseId)?.hm || "";
  };

  const getGradePoint = (hm: string) => {
    const points: Record<string, number> = { A: 4, B: 3, C: 2, D: 1, E: 0 };
    return points[hm] ?? 0;
  };

  const handleGradeChange = (courseId: number, value: string) => {
    setGradeChanges((prev) => ({ ...prev, [courseId]: value }));
  };

  const handleResetRow = (courseId: number) => {
    const newChanges = { ...gradeChanges };
    delete newChanges[courseId];
    setGradeChanges(newChanges);
  };

  // Kalkulasi IPK
  const projectedStats = useMemo(() => {
    const maxSemester = student.profile.semester;
    const relevantCourses = allCourses.filter((c) => c.smt_default <= maxSemester);

    let totalSks = 0;
    let totalPoints = 0;

    relevantCourses.forEach((course) => {
      const hm = getGradeValue(course.id);
      if (hm && ["A", "B", "C", "D", "E"].includes(hm)) {
        const point = getGradePoint(hm);
        totalSks += course.sks;
        totalPoints += course.sks * point;
      }
    });

    const ipk = totalSks === 0 ? 0 : totalPoints / totalSks;
    return { ipk: ipk.toFixed(2), totalSks };
  }, [allCourses, gradeChanges, student.transcript, student.profile.semester]);

  // --- Handlers ---

  const onSaveClick = () => {
    if (Object.keys(gradeChanges).length === 0) {
      toast.info("Tidak ada perubahan nilai yang perlu disimpan.");
      return;
    }
    setShowConfirm(true);
  };

  const handleConfirmSave = async () => {
    setLoading(true);
    try {
      const payload = Object.entries(gradeChanges).map(([cId, hm]) => ({
        course_id: parseInt(cId),
        hm: hm,
      }));

      await onSubmit(parseInt(student.id), payload);
      toast.success(`Nilai mahasiswa ${student.profile.nama} berhasil diperbarui.`);
      onCancel();
    } catch (error) {
      toast.error("Gagal menyimpan perubahan nilai.");
      console.error(error);
    } finally {
      setLoading(false);
      setShowConfirm(false);
    }
  };

  const relevantSemesters = Array.from(
    { length: student.profile.semester },
    (_, i) => i + 1
  );

  return (
    <>
      <Card className="flex flex-col h-[75vh] w-full border bg-background overflow-hidden shadow-sm">
        
        {/* === HEADER === */}
        <div className="flex-none px-6 py-5 border-b bg-background flex justify-between items-start z-10">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              {student.profile.nama}
            </h2>
            
            {/* INFO BARU: Tanpa separator |, NIM badge & Prodi */}
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Badge variant="outline" className="font-mono text-xs font-normal">
                {student.profile.nim}
              </Badge>
              <span>
                {student.profile.prodi} ({student.profile.jenjang})
              </span>
            </div>
          </div>

          {/* Indikator IPK */}
          <div className="text-right">
            <p className="text-[10px] uppercase font-semibold text-muted-foreground tracking-wider mb-0.5">
              Proyeksi IPK
            </p>
            <div className="flex items-baseline justify-end gap-1.5">
              <Calculator className="h-4 w-4 text-primary opacity-80" />
              <span className="text-3xl font-bold text-foreground tracking-tight">
                {projectedStats.ipk}
              </span>
              <span className="text-sm font-medium text-muted-foreground">
                / {projectedStats.totalSks} SKS
              </span>
            </div>
          </div>
        </div>

        {/* === CONTENT === */}
        <div className="flex-1 overflow-y-auto p-6 bg-muted/5">
          <Accordion
            type="multiple"
            defaultValue={[String(student.profile.semester)]}
            className="space-y-4"
          >
            {relevantSemesters.map((smt) => {
              const coursesInSmt = allCourses.filter((c) => c.smt_default === smt);
              if (coursesInSmt.length === 0) return null;
              
              const semesterSks = coursesInSmt.reduce((a, b) => a + b.sks, 0);

              return (
                <AccordionItem
                  key={smt}
                  value={String(smt)}
                  className="border bg-background rounded-lg overflow-hidden shadow-sm"
                >
                  {/* UPDATE: Menghapus kotak nomor semester (1-8) */}
                  <AccordionTrigger className="hover:no-underline px-5 py-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-3 w-full">
                      <span className="font-semibold text-sm">Semester {smt}</span>
                      <span className="ml-auto text-xs text-muted-foreground font-normal">
                        {coursesInSmt.length} Matkul • {semesterSks} SKS
                      </span>
                    </div>
                  </AccordionTrigger>

                  <AccordionContent className="px-0 py-0 border-t">
                    <div className="divide-y divide-border">
                      {coursesInSmt.map((course) => {
                        const currentValue = getGradeValue(course.id);
                        const originalValue = student.transcript.find((t) => t.course_id === course.id)?.hm || "";
                        const isModified = gradeChanges[course.id] !== undefined && gradeChanges[course.id] !== originalValue;

                        return (
                          <div
                            key={course.id}
                            className={cn(
                              "group relative flex items-center justify-between py-3 px-5 transition-colors duration-200",
                              // Styling: Hanya garis biru di kiri saat diedit
                              isModified
                                ? "bg-muted/30 border-l-4 border-l-primary" 
                                : "hover:bg-muted/20 border-l-4 border-l-transparent"
                            )}
                          >
                            {/* Info Matkul */}
                            <div className="flex-1 pr-4 pl-1">
                              <p className={cn("text-sm font-medium", isModified ? "text-foreground" : "text-foreground/80")}>
                                {course.matkul}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                {/* UPDATE: Kode Mata Kuliah menggunakan Badge Outline (Rounded seperti NIM) */}
                                <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-mono font-normal text-muted-foreground">
                                  {course.kode}
                                </Badge>
                                <span className="text-[10px] text-muted-foreground">
                                  {course.sks} SKS
                                </span>
                              </div>
                            </div>

                            {/* Kontrol Nilai */}
                            <div className="flex items-center gap-3">
                              {/* Tombol Reset */}
                              {isModified && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                  onClick={() => handleResetRow(course.id)}
                                  title="Reset"
                                >
                                  <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                              )}

                              <Select
                                value={currentValue}
                                onValueChange={(val) => handleGradeChange(course.id, val)}
                              >
                                <SelectTrigger
                                  className={cn(
                                    "w-[70px] h-9 text-xs font-medium transition-all",
                                    isModified
                                      ? "border-primary/50 ring-1 ring-primary/10 text-foreground"
                                      : "border-input text-muted-foreground"
                                  )}
                                >
                                  <SelectValue placeholder="-" />
                                </SelectTrigger>
                                <SelectContent align="end">
                                  {["A", "B", "C", "D", "E"].map((g) => (
                                    <SelectItem key={g} value={g} className="text-xs">
                                      {g}
                                    </SelectItem>
                                  ))}
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

        {/* === FOOTER === */}
        <div className="flex-none p-4 border-t bg-background flex justify-end gap-2 z-10">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Batal
          </Button>
          <Button 
            onClick={onSaveClick} 
            disabled={loading || Object.keys(gradeChanges).length === 0}
          >
            {loading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={setShowConfirm}
        onConfirm={handleConfirmSave}
        title={`Simpan Nilai ${student.profile.nama}?`}
        description={`Anda akan menyimpan perubahan nilai untuk ${Object.keys(gradeChanges).length} mata kuliah. Pastikan nilai yang diinput sudah sesuai.`}
        confirmLabel="Ya, Simpan"
        cancelLabel="Batal"
      />
    </>
  );
}