import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnLogin = nextUrl.pathname.startsWith("/login");
      
      // Definisikan public asset agar tidak terblokir middleware
      const isPublicAsset = 
        nextUrl.pathname.startsWith("/img") || 
        nextUrl.pathname.startsWith("/public") ||
        nextUrl.pathname.endsWith(".png") ||
        nextUrl.pathname.endsWith(".jpg") ||
        nextUrl.pathname.endsWith(".svg") ||
        nextUrl.pathname.endsWith(".ico");

      if (isPublicAsset) return true;

      if (isOnLogin) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    // Callback JWT: Berjalan saat token dibuat (login) atau diperbarui (akses halaman)
    async jwt({ token, user }) {
      // Jika 'user' ada, berarti ini saat LOGIN PERTAMA KALI
      if (user) {
        token.id = user.id; // Pastikan ID tersimpan di token
        token.role = user.role;
        token.username = user.username;
        token.name = user.name;
      }
      return token;
    },
    // Callback Session: Berjalan saat useSession() atau auth() dipanggil
    async session({ session, token }) {
      // Pindahkan data dari TOKEN ke SESSION agar bisa dibaca di client/server component
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.username = token.username as string;
        session.user.name = token.name as string;
      }
      return session;
    },
  },
  providers: [], 
} satisfies NextAuthConfig;