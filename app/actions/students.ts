'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { StudentData, TranscriptItem, StudentFormValues, StudyProgram } from "@/lib/types";

// Internal Interface untuk Response DB (Mapping hasil join)
interface DBResponseStudent {
  id: number;
  nim: string;
  nama: string;
  alamat: string;
  semester: number;
  study_program_id: number | null;
  // Join result dari supabase
  study_programs: StudyProgram | null;
  grades: {
    id: number;
    hm: string;
    courses: {
      id: number;
      kode: string;
      matkul: string;
      sks: number;
      smt_default: number;
    } | null;
  }[];
}

const getAM = (hm: string): number => {
  const map: Record<string, number> = { 'A': 4, 'B': 3, 'C': 2, 'D': 1 };
  return map[hm] || 0;
};

// --- READ OPERATIONS ---

// Fungsi baru untuk mengambil daftar Program Studi
export async function getStudyPrograms(): Promise<StudyProgram[]> {
  const { data, error } = await supabase
    .from('study_programs')
    .select('*')
    .order('nama', { ascending: true });
  
  if (error) return [];
  return data as StudyProgram[];
}

export async function getStudents(): Promise<StudentData[]> {
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
      study_programs (
        id,
        kode,
        nama,
        jenjang
      ),
      grades (
        id,
        hm,
        courses (
          id,
          kode,
          matkul,
          sks,
          smt_default
        )
      )
    `)
    .order('id', { ascending: true });

  if (error) {
    console.error("Error fetching students:", error.message);
    return [];
  }

  if (!data) return [];

  const students = data as unknown as DBResponseStudent[];

  return students.map((s) => {
    const transcript: TranscriptItem[] = (s.grades || [])
      .map((g, index) => {
        const course = g.courses;
        const am = getAM(g.hm);
        const sks = course?.sks || 0;
        const nm = am * sks;

        return {
          no: index + 1,
          course_id: course?.id || 0,
          kode: course?.kode || "CODE",
          matkul: course?.matkul || "Unknown",
          smt: course?.smt_default || 1,
          sks: sks,
          hm: g.hm,
          am: am,
          nm: nm
        };
      })
      .sort((a, b) => a.smt - b.smt || a.kode.localeCompare(b.kode));

    return {
      id: String(s.id),
      profile: {
        id: s.id,
        nim: s.nim,
        nama: s.nama,
        alamat: s.alamat,
        semester: s.semester,
        study_program_id: s.study_program_id,
        study_program: s.study_programs // Data prodi dari relasi
      },
      transcript: transcript
    };
  });
}

// --- CRUD OPERATIONS ---

export async function createStudent(values: StudentFormValues) {
  const { error } = await supabase.from('students').insert([{
    nim: values.nim,
    nama: values.nama,
    semester: Number(values.semester),
    alamat: values.alamat,
    // Simpan ID program studi
    study_program_id: values.study_program_id ? Number(values.study_program_id) : null
  }]);
  
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa'); 
}

export async function updateStudent(id: string | number, values: StudentFormValues) {
  const { error } = await supabase.from('students').update({
    nim: values.nim,
    nama: values.nama,
    semester: Number(values.semester),
    alamat: values.alamat,
    study_program_id: values.study_program_id ? Number(values.study_program_id) : null
  }).eq('id', Number(id));

  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}

export async function deleteStudent(id: string | number) {
  const { error } = await supabase.from('students').delete().eq('id', Number(id));
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}