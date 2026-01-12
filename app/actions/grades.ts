// app/actions/grades.ts
"use server";

import { supabase } from "@/lib/supabase";
import { GradeData, GradeFormValues } from "@/lib/types";
import { revalidatePath } from "next/cache";

// --- FETCH DATA ---

// 1. Ambil semua grades (Legacy/Admin)
export async function getGrades(): Promise<GradeData[]> {
  const { data, error } = await supabase
    .from("grades")
    .select(`
      *,
      student:students (
        id, 
        nim, 
        nama, 
        study_program:study_programs (
           nama,
           jenjang
        )
      ),
      course:courses (id, kode, matkul, sks)
    `)
    .order("hm", { ascending: true }); 

  if (error) throw new Error(error.message);
  return data as unknown as GradeData[];
}

// 2. Ambil Mata Kuliah HANYA dari KRS yang Disetujui (Untuk Input Nilai Admin)
export async function getStudentCoursesForGrading(studentId: string) {
  try {
    const { data: krsList, error: krsError } = await supabase
      .from("krs")
      .select("course_id")
      .eq("student_id", studentId)
      .eq("status", "APPROVED");

    if (krsError) throw krsError;
    if (!krsList || krsList.length === 0) return [];

    const courseIds = Array.from(new Set(krsList.map((k) => k.course_id)));

    const { data: courses, error: courseError } = await supabase
      .from("courses")
      .select("id, kode, matkul, sks, smt_default")
      .in("id", courseIds)
      .order("smt_default", { ascending: true })
      .order("matkul", { ascending: true });

    if (courseError) throw courseError;
    return courses;
  } catch (error: any) {
    console.error("Error fetching student grading courses:", error.message);
    return [];
  }
}

// 3. Helper Select
export async function getStudentsForSelect() {
  const { data, error } = await supabase
    .from("students")
    .select("id, nim, nama")
    .order("nama", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

export async function getCoursesForSelect() {
  const { data, error } = await supabase
    .from("courses")
    .select("id, kode, matkul")
    .order("matkul", { ascending: true });
  if (error) throw new Error(error.message);
  return data;
}

// --- BARU: Fetch Grade Summary for Student Dashboard (Mirip KRS Data) ---
export async function getStudentGradeSummary(studentId: string) {
  try {
    // Ambil data nilai join dengan courses
    const { data: grades, error } = await supabase
      .from("grades")
      .select(`
        id,
        hm,
        course:courses (
          id,
          kode,
          matkul,
          sks,
          smt_default
        )
      `)
      .eq("student_id", studentId);

    if (error) throw error;

    // Helper konversi HM ke Angka Mutu (AM)
    const getAM = (hm: string) => {
      switch (hm) {
        case "A": return 4;
        case "B": return 3;
        case "C": return 2;
        case "D": return 1;
        default: return 0;
      }
    };

    // Transform data
    const processedData = grades.map((g: any) => {
      const am = getAM(g.hm);
      const sks = g.course.sks;
      return {
        id: g.id,
        kode: g.course.kode,
        matkul: g.course.matkul,
        sks: sks,
        semester: g.course.smt_default,
        hm: g.hm,
        am: am,
        nm: (am * sks) // Nilai Mutu = AM * SKS
      };
    });

    // Hitung Statistik
    const totalSKS = processedData.reduce((acc, curr) => acc + curr.sks, 0);
    const totalNM = processedData.reduce((acc, curr) => acc + curr.nm, 0);
    const ipk = totalSKS > 0 ? (totalNM / totalSKS).toFixed(2) : "0.00";

    // Sort: Semester ASC, lalu Nama Matkul ASC
    processedData.sort((a, b) => {
        if (a.semester !== b.semester) return a.semester - b.semester;
        return a.matkul.localeCompare(b.matkul);
    });

    return {
      grades: processedData,
      summary: { totalSKS, totalNM, ipk }
    };

  } catch (error: any) {
    console.error("Error fetching student grades:", error.message);
    return { grades: [], summary: { totalSKS: 0, totalNM: 0, ipk: "0.00" } };
  }
}

// --- BATCH SAVE OPERATION ---
export async function saveStudentGrades(
  studentId: string, 
  grades: { course_id: string, hm: string }[] 
) {
  for (const item of grades) {
    const { data: existing } = await supabase
      .from("grades")
      .select("id")
      .eq("student_id", studentId)
      .eq("course_id", item.course_id)
      .single();

    if (existing) {
      await supabase.from("grades").update({ hm: item.hm }).eq("id", existing.id);
    } else {
      if (item.hm) {
        await supabase.from("grades").insert({
          student_id: studentId,
          course_id: item.course_id,
          hm: item.hm
        });
      }
    }
  }
  revalidatePath("/nilai");
}

// --- CRUD SINGLE ---
export async function createGrade(formData: GradeFormValues) {
  const { error } = await supabase.from("grades").insert({
    student_id: formData.student_id,
    course_id: formData.course_id,
    hm: formData.hm,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}

export async function updateGrade(id: string, formData: GradeFormValues) {
  const { error } = await supabase
    .from("grades")
    .update({
      student_id: formData.student_id,
      course_id: formData.course_id,
      hm: formData.hm,
    })
    .eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}

export async function deleteGrade(id: string) {
  const { error } = await supabase.from("grades").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/nilai");
}