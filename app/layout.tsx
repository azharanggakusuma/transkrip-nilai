import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- KONFIGURASI SEO & METADATA ---
export const metadata: Metadata = {
  title: "SIAKAD STMIK IKMI Cirebon | Transkrip Nilai Digital",
  description: "Sistem Informasi Akademik STMIK IKMI Cirebon. Layanan cetak dan validasi transkrip nilai mahasiswa secara digital.",
  keywords: [
    "SIAKAD",
    "STMIK IKMI",
    "IKMI Cirebon",
    "Transkrip Nilai",
    "Akademik",
    "Kampus Cirebon",
    "Teknik Informatika",
    "Rekayasa Perangkat Lunak"
  ],
  authors: [{ name: "Bagian Administrasi Akademik (BAA) STMIK IKMI" }],
  creator: "STMIK IKMI Cirebon",
  publisher: "STMIK IKMI Cirebon",
  
  // Ikon di Tab Browser
  icons: {
    icon: "/img/logo-ikmi.png", 
    shortcut: "/img/logo-ikmi.png",
    apple: "/img/logo-ikmi.png",
  },

  // Tampilan saat link dibagikan di Sosmed (WhatsApp/FB/Twitter)
  openGraph: {
    title: "SIAKAD STMIK IKMI Cirebon",
    description: "Cetak Transkrip Nilai Mahasiswa & Layanan Akademik Digital.",
    url: "https://ikmi.ac.id",
    siteName: "SIAKAD IKMI",
    images: [
      {
        url: "/img/logo-ikmi.png", // Menggunakan logo sebagai preview
        width: 800,
        height: 800,
        alt: "Logo STMIK IKMI Cirebon",
      },
    ],
    locale: "id_ID",
    type: "website",
  },

  // Konfigurasi Robot (Agar terindeks Google)
  robots: {
    index: true,
    follow: true,
    nocache: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Ubah lang='en' jadi 'id' untuk SEO Indonesia
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-100`}
      >
        {children}
      </body>
    </html>
  );
}