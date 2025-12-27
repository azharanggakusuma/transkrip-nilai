import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials;

        // Query ke database Supabase (tabel 'users')
        // Menggunakan .single() karena username harus unik
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        // Jika terjadi error (misal koneksi gagal) atau user tidak ditemukan
        if (error || !user) {
          return null;
        }

        // Validasi Password
        // (Pastikan password di database tersimpan sebagai string biasa sesuai logika sebelumnya)
        if (user.password === password) {
          // Return objek user untuk sesi
          // Properti ini akan diteruskan ke callback jwt dan session di auth.config.ts
          return {
            id: String(user.id),
            name: user.name,
            username: user.username,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
});