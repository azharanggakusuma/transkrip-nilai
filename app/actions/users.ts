"use server";

import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

// --- KONFIGURASI SUPABASE ADMIN ---
// Menggunakan Service Role Key untuk bypass RLS (Wajib untuk manajemen user)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || "", {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Tipe Data User
export type UserData = {
  id: string;
  name: string;
  username: string;
  role: string;
  student_id?: number | null; // ID Mahasiswa yang tertaut
};

// Tipe Data untuk Dropdown Pilihan Mahasiswa
export type StudentOption = {
  id: number;
  nim: string;
  nama: string;
  is_taken: boolean; // True jika mahasiswa ini sudah punya akun user lain
};

// === GET USERS ===
export async function getUsers() {
  const { data, error } = await supabaseAdmin
    .from("users")
    .select("id, name, username, role, student_id")
    .order("name", { ascending: true });

  if (error) return [];
  return data as UserData[];
}

// === HELPER: GET STUDENTS FOR SELECTION ===
// Mengambil semua mahasiswa & menandai mana yang sudah punya akun
export async function getStudentsForSelection(excludeUserId?: string) {
  // 1. Ambil semua data students dari database
  const { data: students, error: errStudent } = await supabaseAdmin
    .from("students")
    .select("id, nim, nama")
    .order("nim", { ascending: true });

  if (errStudent || !students) return [];

  // 2. Ambil semua student_id yang sudah dipakai di tabel users
  //    Jika sedang edit user (excludeUserId ada), jangan anggap student milik user tersebut sebagai "taken"
  let query = supabaseAdmin.from("users").select("student_id").not("student_id", "is", null);
  
  if (excludeUserId) {
    query = query.neq("id", excludeUserId);
  }

  const { data: usedUsers } = await query;
  
  // Buat Set agar pencarian lebih cepat
  const usedStudentIds = new Set(usedUsers?.map((u) => u.student_id));

  // 3. Mapping data mahasiswa + status is_taken
  return students.map((s) => ({
    id: s.id,
    nim: s.nim,
    nama: s.nama,
    is_taken: usedStudentIds.has(s.id),
  })) as StudentOption[];
}

// === CREATE USER ===
export async function createUser(values: any) {
  const { name, username, password, role, student_id } = values;
  
  // Hash password sebelum disimpan
  const hashedPassword = await bcrypt.hash(password, 10);

  const payload: any = {
    name,
    username,
    password: hashedPassword,
    role: role || "mahasiswa",
  };

  // Hanya simpan student_id jika role mahasiswa dan ada nilainya
  if (role === "mahasiswa" && student_id) {
    payload.student_id = Number(student_id);
  } else {
    payload.student_id = null;
  }

  const { error } = await supabaseAdmin.from("users").insert([payload]);

  if (error) {
    if (error.code === "23505") throw new Error("Username sudah digunakan.");
    throw new Error(error.message);
  }

  revalidatePath("/users");
}

// === UPDATE USER ===
export async function updateUser(id: string, values: any) {
  const { name, username, password, role, student_id } = values;

  const updates: any = {
    name,
    username,
    role,
  };

  // Update password hanya jika diisi
  if (password && password.trim() !== "") {
    updates.password = await bcrypt.hash(password, 10);
  }

  // Logika update student_id
  if (role === "mahasiswa") {
    updates.student_id = student_id ? Number(student_id) : null;
  } else {
    // Jika role diubah jadi admin/dosen, lepas relasi student
    updates.student_id = null; 
  }

  const { error } = await supabaseAdmin
    .from("users")
    .update(updates)
    .eq("id", id);

  if (error) throw new Error(error.message);

  revalidatePath("/users");
}

// === DELETE USER ===
export async function deleteUser(id: string) {
  const { error } = await supabaseAdmin.from("users").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/users");
}