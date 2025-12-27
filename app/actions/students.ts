'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

// Helper konversi nilai huruf ke angka
const getAM = (hm: string) => {
  switch (hm) {
    case 'A': return 4;
    case 'B': return 3;
    case 'C': return 2;
    case 'D': return 1;
    default: return 0;
  }
};

export async function getStudents() {
  // Query join: students -> grades -> courses
  // PERBAIKAN: Menggunakan 'matkul' dan 'smt_default' sesuai nama kolom database
  const { data, error } = await supabase
    .from('students')
    .select(`
      *,
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
    console.error("Gagal ambil mahasiswa:", error); // Log error agar terlihat di terminal
    return [];
  }

  // Format data agar sesuai dengan UI yang sudah ada
  return data.map((s) => {
    // Mapping Grades ke format Transcript
    // @ts-ignore
    const transcript = s.grades ? s.grades.map((g: any, index: number) => {
      const course = g.courses;
      const am = getAM(g.hm);
      const nm = am * (course?.sks || 0);

      return {
        no: index + 1,
        course_id: course?.id,
        // Mapping kolom DB ke properti UI
        kode: course?.kode || "CODE",
        matkul: course?.matkul || "Unknown",     // Ambil dari 'matkul'
        smt: course?.smt_default || 1,           // Ambil dari 'smt_default'
        sks: course?.sks || 0,
        hm: g.hm,
        am: am,
        nm: nm
      };
    }).sort((a: any, b: any) => a.smt - b.smt || a.kode.localeCompare(b.kode)) : [];

    return {
      id: String(s.id),
      profile: {
        id: s.id,
        nim: s.nim,
        nama: s.nama,
        alamat: s.alamat,
        prodi: s.prodi,
        jenjang: s.jenjang,
        semester: s.semester
      },
      transcript: transcript
    };
  });
}

// --- CREATE, UPDATE, DELETE TETAP SAMA ---

export async function createStudent(values: any) {
  const { error } = await supabase.from('students').insert([{
      nim: values.nim, nama: values.nama, prodi: values.prodi,
      jenjang: values.jenjang, semester: Number(values.semester), alamat: values.alamat
  }]);
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa'); 
}

export async function updateStudent(id: string | number, values: any) {
  const { error } = await supabase.from('students').update({
      nim: values.nim, nama: values.nama, prodi: values.prodi,
      jenjang: values.jenjang, semester: Number(values.semester), alamat: values.alamat
  }).eq('id', Number(id));
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}

export async function deleteStudent(id: string | number) {
  const { error } = await supabase.from('students').delete().eq('id', Number(id));
  if (error) throw new Error(error.message);
  revalidatePath('/mahasiswa');
}