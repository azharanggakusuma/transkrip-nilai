// components/features/nilai/StudentTable.tsx
"use client";

import React from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { StudentData } from "@/lib/types";

interface StudentTableProps {
  data: StudentData[];
  isLoading: boolean;
  startIndex: number;
  searchQuery: string;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  onEdit: (student: StudentData) => void;
}

export function StudentTable({
  data,
  isLoading,
  startIndex,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  onEdit,
}: StudentTableProps) {
  
  // Definisi Kolom dipindah ke sini
  const columns: Column<StudentData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>
    },
    {
      header: "NIM",
      className: "w-[120px]",
      render: (row) => <span className="font-mono font-medium">{row.profile.nim}</span>
    },
    {
      header: "Nama Mahasiswa",
      render: (row) => (
         <p className="font-semibold text-slate-800">{row.profile.nama}</p>
      )
    },
    {
      header: "Prodi",
      className: "w-[180px]",
      render: (row) => <span className="text-slate-600 text-sm">{row.profile.prodi}</span>
    },
    {
      header: "Jenjang",
      className: "w-[100px] text-center",
      render: (row) => <span className="text-slate-600 text-sm">{row.profile.jenjang}</span>
    },
    {
      header: "Semester",
      className: "w-[100px] text-center",
      render: (row) => (
        <span className="font-medium text-slate-700">{row.profile.semester}</span>
      )
    },
    {
        header: "SKS Diambil",
        className: "w-[100px] text-center",
        render: (row) => {
            const totalSKS = row.transcript.reduce((acc, curr) => acc + curr.sks, 0);
            return <span className="font-medium">{totalSKS}</span>
        }
    },
    {
      header: "Aksi",
      className: "text-center w-[120px]",
      render: (row) => (
        <Button 
            size="sm" 
            className="h-8 w-full font-medium shadow-sm"
            onClick={() => onEdit(row)}
        >
            <PencilLine className="w-3.5 h-3.5 mr-2" />
            Kelola Nilai
        </Button>
      )
    }
  ];

  // Hitung endIndex untuk tampilan pagination
  // (opsional, tergantung implementasi DataTable Anda, tapi umumnya needed)
  const itemsPerPage = 10; // Asumsi default, atau bisa dipass via props
  const endIndex = startIndex + itemsPerPage;

  return (
    <DataTable
      data={data}
      columns={columns}
      isLoading={isLoading}
      searchQuery={searchQuery}
      onSearchChange={onSearchChange}
      searchPlaceholder="Cari Nama Mahasiswa / NIM..."
      currentPage={currentPage}
      totalPages={totalPages}
      onPageChange={onPageChange}
      startIndex={startIndex}
      endIndex={endIndex}
      totalItems={totalItems}
    />
  );
}