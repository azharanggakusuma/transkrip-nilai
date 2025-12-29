"use client";

import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardContent } from "@/components/ui/card";

export default function NilaiPage() {
  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      {/* Header Halaman */}
      <PageHeader title="Nilai Mahasiswa" breadcrumb={["SIAKAD", "Nilai Mahasiswa"]} />

      {/* Konten Halaman Kosong */}
      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px] text-center">
          <div className="p-4 rounded-full bg-slate-100 mb-4">
            <span className="text-4xl">🎓</span>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Halaman Nilai Mahasiswa</h3>
          <p className="text-slate-500 max-w-sm mt-2">
            Halaman ini telah dibuat dan siap untuk dikembangkan lebih lanjut.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}