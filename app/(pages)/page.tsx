"use client";

import React from "react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Section dengan Gradient */}
      <div className="relative overflow-hidden bg-white p-8 rounded-2xl border border-slate-200 shadow-sm group">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-blue-50 rounded-full blur-3xl group-hover:bg-blue-100 transition-colors duration-500"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-slate-800 tracking-tight">
            Selamat Datang Kembali, <span className="text-[#1B3F95]">Admin!</span> 👋
          </h2>
          <p className="text-slate-500 mt-2 max-w-2xl leading-relaxed">
            Sistem Informasi Akademik siap membantu Anda mengelola data hari ini. 
            Pantau statistik cepat atau cetak transkrip mahasiswa dengan mudah.
          </p>
        </div>
      </div>

      {/* Stats Cards dengan Ikon & Hover Effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          label="Total Mahasiswa" 
          value="120" 
          icon={<UserGroupIcon />} 
          color="bg-blue-500" 
        />
        <StatCard 
          label="Mata Kuliah" 
          value="45" 
          icon={<BookOpenIcon />} 
          color="bg-indigo-500" 
        />
        <StatCard 
          label="Transkrip Dicetak" 
          value="312" 
          icon={<PrinterIcon />} 
          color="bg-emerald-500" 
        />
      </div>

      {/* Main Content Area: Recent Activity & Quick Action */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
            <span className="w-1.5 h-6 bg-[#1B3F95] rounded-full"></span>
            Aktivitas Terbaru
          </h3>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ClockIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">Transkrip Dicetak: Azharangga Kusuma</p>
                  <p className="text-[11px] text-slate-400 uppercase font-bold tracking-tighter">10 Menit yang lalu</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1B3F95] p-8 rounded-2xl shadow-xl shadow-blue-900/10 flex flex-col justify-center text-white relative overflow-hidden">
          <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-1/4 translate-y-1/4">
             <PrinterIcon size={200} />
          </div>
          <h3 className="text-xl font-bold mb-3 relative z-10">Butuh Cetak Cepat?</h3>
          <p className="text-blue-100/80 text-sm mb-6 relative z-10 leading-relaxed">
            Langsung menuju halaman transkrip untuk mencari mahasiswa dan mengunduh dokumen resmi.
          </p>
          <a href="/transkrip" className="bg-white text-[#1B3F95] px-6 py-3 rounded-xl font-bold text-sm self-start hover:bg-blue-50 transition-all shadow-lg active:scale-95 relative z-10">
            Buka Transkrip Nilai
          </a>
        </div>
      </div>
    </div>
  );
}

// Komponen Kecil untuk Kartu Statistik
function StatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
          <p className="text-4xl font-black text-slate-800 tracking-tighter group-hover:text-[#1B3F95] transition-colors">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-inherit`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

// Ikon-ikon sederhana
const UserGroupIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
const BookOpenIcon = () => <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
const PrinterIcon = ({ size = 24 }: { size?: number }) => <svg style={{ width: size, height: size }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>;
const ClockIcon = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;