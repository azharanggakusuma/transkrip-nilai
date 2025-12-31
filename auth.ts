// auth.ts
import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { createClient } from "@supabase/supabase-js"; 
import bcrypt from "bcryptjs";
import { User } from "next-auth"; // Import tipe User

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials): Promise<User | null> {
        const { username, password } = credentials;

        const supabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        );

        // Ambil data user
        const { data: user, error } = await supabase
          .from("users")
          .select("*")
          .eq("username", username)
          .single();

        if (error || !user) {
          return null;
        }

        // Cek Status Aktif
        if (user.is_active === false) {
           throw new Error("InactiveAccount");
        }

        // Cek Password
        const passwordsMatch = await bcrypt.compare(
          password as string, 
          user.password
        );

        if (passwordsMatch) {
          // PENTING: Kembalikan objek yang lengkap sesuai tipe User
          return {
            id: String(user.id), // Konversi ke string agar aman
            name: user.name,
            username: user.username,
            role: user.role,
            // Anda bisa tambahkan field lain jika perlu, tapi pastikan ada di next-auth.d.ts
          };
        }

        return null;
      },
    }),
  ],
});