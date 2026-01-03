'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";
import { AcademicYear, AcademicYearFormValues } from "@/lib/types";

// --- HELPER: RESET ACTIVE STATUS ---
// Jika ada tahun akademik baru yang diset AKTIF, maka yang lain harus NON-AKTIF
const resetActiveStatus = async () => {
  const { error } = await supabase
    .from('academic_years')
    .update({ is_active: false })
    .neq('is_active', false); // Update semua yang true jadi false

  if (error) console.error("Error resetting active status:", error);
};

// --- CRUD OPERATIONS ---

export async function getAcademicYears() {
  const { data, error } = await supabase
    .from('academic_years')
    .select('*')
    .order('nama', { ascending: false }); // Urutkan dari tahun terbaru

  if (error) {
    console.error("Error fetching academic years:", error.message);
    return [];
  }
  return data as AcademicYear[];
}

export async function createAcademicYear(values: AcademicYearFormValues) {
  // 1. Jika user memilih Aktif, matikan dulu yang lain
  if (values.is_active) {
    await resetActiveStatus();
  }

  // 2. Insert data baru
  const { error } = await supabase
    .from('academic_years')
    .insert([{
      nama: values.nama,
      semester: values.semester,
      is_active: values.is_active
    }]);

  if (error) throw new Error("Gagal menambah Tahun Akademik.");
  revalidatePath('/tahun-akademik');
}

export async function updateAcademicYear(id: string, values: AcademicYearFormValues) {
  // 1. Jika user memilih Aktif, matikan dulu yang lain
  if (values.is_active) {
    await resetActiveStatus();
  }

  // 2. Update data
  const { error } = await supabase
    .from('academic_years')
    .update({
      nama: values.nama,
      semester: values.semester,
      is_active: values.is_active
    })
    .eq('id', id);

  if (error) throw new Error("Gagal mengupdate Tahun Akademik.");
  revalidatePath('/tahun-akademik');
}

export async function deleteAcademicYear(id: string) {
  const { error } = await supabase
    .from('academic_years')
    .delete()
    .eq('id', id);

  if (error) throw new Error("Gagal menghapus data.");
  revalidatePath('/tahun-akademik');
}