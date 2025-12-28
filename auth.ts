import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { supabase } from "@/lib/supabase";
import bcrypt from "bcryptjs"; // Menggunakan bcryptjs

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const { username, password } = credentials;

        // 1. Ambil data user dari Supabase
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        // 2. Jika user tidak ditemukan atau ada error database
        if (error || !user) {
          return null;
        }

        // 3. Cek password menggunakan bcryptjs
        // Membandingkan password input (plain) dengan hash di database
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