"use client";

import React, { useState, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { students as initialData, StudentData } from "@/lib/data";

export default function MahasiswaPage() {
  // --- STATE ---
  const [dataList, setDataList] = useState<StudentData[]>(initialData);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Menampilkan 8 baris per halaman agar pas di layar laptop

  // --- FILTER & SEARCH ---
  const filteredData = useMemo(() => {
    return dataList.filter((student) => {
      const query = searchQuery.toLowerCase();
      return (
        student.profile.nama.toLowerCase().includes(query) ||
        student.profile.nim.toLowerCase().includes(query) ||
        student.profile.prodi.toLowerCase().includes(query)
      );
    });
  }, [dataList, searchQuery]);

  // --- PAGINATION ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredData.slice(start, start + itemsPerPage);
  }, [filteredData, currentPage, itemsPerPage]);

  React.useEffect(() => {
    setCurrentPage(1); // Reset ke hal 1 saat search berubah
  }, [searchQuery]);

  // --- ACTIONS (MOCK) ---
  const handleDelete = (id: string, nama: string) => {
    if (confirm(`Hapus data mahasiswa ${nama}?`)) {
      setDataList((prev) => prev.filter((item) => item.id !== id));
    }
  };

  const handleAdd = () => {
    alert("Fitur Tambah Mahasiswa (Gunakan Modal Form di sini)");
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-full">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHeader 
          title="Data Mahasiswa" 
          breadcrumb={["SIAKAD", "Mahasiswa"]} 
        />
        
        {/* Tombol Tambah di Header (Mobile Friendly) */}
        <button
          onClick={handleAdd}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1B3F95] text-white text-sm font-medium rounded-xl hover:bg-blue-800 transition shadow-sm shadow-blue-900/20 active:scale-95"
        >
          <PlusIcon className="w-4 h-4" />
          <span>Tambah Data</span>
        </button>
      </div>

      {/* CARD CONTAINER */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
        
        {/* TOOLBAR (Search) */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari Nama, NIM, atau Prodi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#1B3F95]/20 focus:border-[#1B3F95] transition-all"
            />
          </div>
          
          <div className="text-xs text-slate-500 font-medium">
            Total: <span className="text-slate-900">{filteredData.length}</span> Mahasiswa
          </div>
        </div>

        {/* TABLE WRAPPER (Responsive) */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4 w-16 text-center">No</th>
                <th className="px-6 py-4 min-w-[250px]">Identitas Mahasiswa</th>
                <th className="px-6 py-4 min-w-[200px]">Program Studi</th>
                <th className="px-6 py-4 text-center w-24">Smt</th>
                <th className="px-6 py-4 text-center w-32">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentData.length > 0 ? (
                currentData.map((student, index) => (
                  <tr 
                    key={student.id} 
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="px-6 py-4 text-center text-xs text-slate-500">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-[#1B3F95] font-bold text-xs shrink-0">
                          {getInitials(student.profile.nama)}
                        </div>
                        <div className="flex flex-col max-w-[200px] sm:max-w-xs">
                          <span className="text-sm font-semibold text-slate-900 truncate">
                            {student.profile.nama}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {student.profile.nim}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
                        {student.profile.prodi}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-sm font-bold text-slate-700">
                        {student.profile.semester}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100" 
                          title="Edit Data"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(student.id, student.profile.nama)}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-100" 
                          title="Hapus Data"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <div className="p-3 bg-slate-50 rounded-full">
                        <SearchIcon className="w-6 h-6 text-slate-300" />
                      </div>
                      <p className="text-sm">Data tidak ditemukan.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION FOOTER */}
        {filteredData.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white rounded-b-xl">
            <span className="text-xs text-slate-500 hidden sm:inline">
              Hal <span className="font-bold text-slate-800">{currentPage}</span> dari {totalPages}
            </span>

            <div className="flex items-center gap-1 mx-auto sm:mx-0">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Prev
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let p = i + 1;
                  // Logika simple slider halaman
                  if (totalPages > 5 && currentPage > 3) {
                     p = currentPage - 2 + i;
                  }
                  if (p > totalPages) return null;
                  
                  return (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 flex items-center justify-center text-xs rounded-lg font-medium transition ${
                        currentPage === p
                          ? "bg-[#1B3F95] text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- UTILS & ICONS ---

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase();
}

// Ikon-ikon sederhana menggunakan SVG
function PlusIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
}
function SearchIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function PencilIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>;
}
function XIcon({ className }: { className?: string }) { 
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>;
}
function TrashIcon({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;
}