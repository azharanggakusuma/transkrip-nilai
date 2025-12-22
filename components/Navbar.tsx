"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const getPageInfo = (path: string) => {
    switch (path) {
      case "/": return { title: "Dashboard Overview", breadcrumb: "SIAKAD" };
      case "/transkrip": return { title: "Transkrip Nilai", breadcrumb: "SIAKAD / Transkrip" };
      case "/mahasiswa": return { title: "Data Mahasiswa", breadcrumb: "SIAKAD / Mahasiswa" };
      case "/matakuliah": return { title: "Mata Kuliah", breadcrumb: "SIAKAD / Mata Kuliah" };
      case "/pengaturan": return { title: "Pengaturan", breadcrumb: "SIAKAD / Pengaturan" };
      default: return { title: "Halaman", breadcrumb: "SIAKAD" };
    }
  };

  const { title, breadcrumb } = getPageInfo(pathname || "/");

  return (
    <nav className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 print:hidden font-sans">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* KIRI: Judul & Breadcrumb */}
        <div className="flex flex-col min-w-[180px]">
          <h1 className="text-lg font-semibold text-slate-800 leading-none">{title}</h1>
          <span className="text-[11px] text-slate-400 mt-1">{breadcrumb}</span>
        </div>

        {/* KANAN: Grouping Search & Akun dengan Jarak Sama */}
        <div className="flex items-center h-full gap-0">
          
          {/* 1. Search Bar */}
          <div className="flex items-center px-4 h-full">
            <div className="relative w-full max-w-[200px] hidden md:block">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 pointer-events-none">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </span>
              <input 
                type="text"
                placeholder="Cari..." 
                className="w-full bg-slate-100 border-none rounded-lg py-1.5 pl-9 pr-4 text-sm focus:ring-1 focus:ring-slate-200 transition-all outline-none text-slate-700 placeholder:text-slate-400" 
              />
            </div>
          </div>

          {/* 2. Pembatas (Divider) */}
          <div className="h-6 w-px bg-slate-200 self-center"></div>

          {/* 3. User Profile */}
          <div className="flex items-center px-4 h-full">
            <div className="flex items-center gap-2.5 hover:bg-slate-50 p-1.5 pr-3 rounded-lg cursor-pointer transition-colors">
              <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 overflow-hidden shrink-0 border border-slate-200">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-700 leading-none">Baaqiel A</span>
                <span className="text-[10px] text-slate-400 mt-1 font-medium uppercase tracking-tight">Admin</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </nav>
  );
}