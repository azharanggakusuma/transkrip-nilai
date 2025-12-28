// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js"; // Import createClient, bukan instance global
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials;

        // 1. Inisialisasi Supabase Client KHUSUS untuk Auth (pakai Service Role)
        // Pastikan SUPABASE_SERVICE_ROLE_KEY ada di .env Anda
        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // 2. Ambil data user dari Supabase (Bypass RLS karena pakai Service Role)
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        // 3. Jika user tidak ditemukan atau ada error database
        if (error || !user) {
          return null;
        }

        // 4. Cek password menggunakan bcryptjs
        const passwordsMatch = await bcrypt.compare(
          password as string, 
          user.password
        );

        if (passwordsMatch) {
          // Return data user untuk sesi jika password cocok
          return {
            id: String(user.id),
            name: user.name,
            username: user.username,
            role: user.role,
          };
        }

        // Return null jika password salah
        return null;
      },
    }),
  ],
});