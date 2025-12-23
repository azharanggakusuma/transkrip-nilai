"use client";
import React from "react";
import PageHeader from "@/components/PageHeader";

export default function MahasiswaPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Data Mahasiswa" 
        breadcrumb={["SIAKAD", "Mahasiswa"]} 
      />
      
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        {/* Judul h2 dihapus karena sudah ada di PageHeader */}
        <div className="border-2 border-dashed border-gray-200 rounded-xl h-96 flex items-center justify-center text-gray-400">
          Modul pengelolaan data mahasiswa sedang dikembangkan.
        </div>
      </div>
    </div>
  );
}