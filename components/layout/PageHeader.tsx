"use client";

import React from "react";
import { usePathname } from "next/navigation";

// Mapping URL ke Nama Menu Sidebar (Untuk Title)
const SIDEBAR_LABELS: Record<string, string> = {
  "dashboard": "Dashboard",
  "mahasiswa": "Data Mahasiswa",
  "matakuliah": "Mata Kuliah",
  "krs": "Kartu Rencana Studi",
  "khs": "Kartu Hasil Studi",
  "nilai": "Kelola Nilai",
  "transkrip": "Transkrip Nilai",
  "surat-keterangan": "Surat Keterangan",
  "users": "Data Pengguna",
  "menus": "Manajemen Menu",
  "pengaturan": "Pengaturan",
};

interface PageHeaderProps {
  title?: string;
  breadcrumb?: string[];
}

export default function PageHeader({ title, breadcrumb }: PageHeaderProps = {}) {
  const pathname = usePathname();

  // Helper: Format teks folder biasa (misal: "mata-kuliah" -> "Mata Kuliah")
  const formatFolderName = (text: string) => {
    return text
      .replace(/-/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  };

  // 1. Ambil segments dari URL
  const segments = pathname.split("/").filter((item) => item !== "");

  // --- LOGIKA BREADCRUMB ---
  let activeBreadcrumb = breadcrumb;
  if (!activeBreadcrumb) {
    activeBreadcrumb = ["Beranda", ...segments.map(formatFolderName)];
  }

  // --- LOGIKA TITLE ---
  let activeTitle = title;
  if (!activeTitle) {
    if (segments.length === 0) {
      activeTitle = "Dashboard";
    } else {
      const rootSegment = segments[0].toLowerCase();
      activeTitle = SIDEBAR_LABELS[rootSegment] || formatFolderName(rootSegment);
    }
  }

  return (
    <div className="flex flex-col min-w-0">
      <h1 className="text-2xl font-bold tracking-tight text-slate-800 truncate">
        {activeTitle}
      </h1>
      <div className="mt-1 flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-slate-400 truncate">
        {activeBreadcrumb.map((item, idx) => (
          <React.Fragment key={`${item}-${idx}`}>
            <span className="truncate">{item}</span>
            {idx < activeBreadcrumb!.length - 1 && (
              <span className="text-slate-300 shrink-0">/</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}