"use server";

import { signIn, signOut, auth } from "@/auth";
import { AuthError } from "next-auth";
import { supabase } from "@/lib/supabase";

export type UserSession = {
  username: string;
  name?: string; 
  role?: string;
};

export async function authenticate(formData: FormData) {
  try {
    const data = Object.fromEntries(formData);
    const username = data.username as string;

    // Cari nama user dari Supabase untuk pesan sapaan (Toast)
    let name = "Pengguna";

    const { data: userFound } = await supabase
      .from("users")
      .select("name")
      .eq("username", username)
      .single();

    if (userFound?.name) {
      name = userFound.name;
    }

    // Melakukan proses login dengan NextAuth
    await signIn("credentials", { 
      ...data, 
      redirect: false 
    });
    
    // Mengembalikan sukses beserta nama untuk ditampilkan di UI
    return { success: true, name: name };

  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { success: false, error: "Username atau Password salah." };
        default:
          return { success: false, error: "Terjadi kesalahan sistem." };
      }
    }
    throw error;
  }
}

export async function logout() {
  await signOut({ redirectTo: "/login" });
}

export async function getSession(): Promise<UserSession | null> {
  const session = await auth();
  
  if (!session?.user) return null;
  
  // Mapping session NextAuth kembali ke struktur UserSession aplikasi
  // Menggunakan 'as any' untuk menghindari error TypeScript jika type definition belum diupdate
  return {
    username: (session.user as any).username || "",
    name: session.user.name || "",
    role: (session.user as any).role || "mahasiswa",
  };
}