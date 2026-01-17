"use client";

import React, { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, CheckCircle, Award, GraduationCap, AlertCircle } from "lucide-react";

import { getMbkmStudents } from "@/app/actions/mbkm";
import { StudentMBKM } from "@/lib/types";
import { useLayout } from "@/app/context/LayoutContext";

export default function StudentMbkmView() {
  const { user } = useLayout();
  const [dataList, setDataList] = useState<StudentMBKM[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const mbkmData = await getMbkmStudents();
      // Filter hanya data mahasiswa yang sedang login
      const myMbkm = mbkmData.filter(item => item.student_id === user?.student_id);
      setDataList(myMbkm);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user?.student_id) {
        fetchData();
    } else {
        setIsLoading(false);
    }
  }, [user]);

  // Statistics
  const totalPrograms = dataList.length;
  // Assumption: If data exists, student is active in MBKM. If status field exists in future, update logic.
  const isActive = totalPrograms > 0; 
  
  // Pagination Logic
  const totalPages = Math.ceil(dataList.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = dataList.slice(startIndex, endIndex);

  // --- COLUMNS ---
  const columns: Column<StudentMBKM>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    {
      header: "Periode",
      className: "w-[150px]",
      render: (row) => (
        <Badge variant="outline" className="bg-slate-50 text-slate-700 whitespace-nowrap">
          {row.academic_year?.nama} ({row.academic_year?.semester})
        </Badge>
      )
    },
    {
      header: "Program MBKM",
      accessorKey: "jenis_mbkm",
      className: "min-w-[180px] font-medium text-gray-700"
    },
    {
      header: "Mitra",
      accessorKey: "mitra",
      className: "min-w-[150px] text-gray-600"
    },
    {
        header: "Keterangan",
        accessorKey: "keterangan",
        className: "min-w-[200px] text-gray-500",
        render: (row) => row.keterangan || "-"
      },
  ];

  if (isLoading) {
      return (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Skeleton className="h-32 w-full rounded-xl" />
                  <Skeleton className="h-32 w-full rounded-xl" />
              </div>
              <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
      );
  }

  // --- EMPTY STATE ---
  if (!isLoading && dataList.length === 0) {
      return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* SIMPLE ELEGANT EMPTY STATE */}
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-xl border border-slate-100 bg-white shadow-sm">
                <div className="p-4 bg-slate-50 rounded-full mb-4">
                    <BookOpen className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">Belum Ada Program MBKM</h3>
                <p className="text-slate-500 max-w-sm mx-auto text-sm leading-relaxed">
                    Anda belum terdaftar dalam program MBKM pada periode akademik ini.
                    Data akan muncul di sini setelah Anda mendaftar dan disetujui.
                </p>
            </div>
        </div>
      );
  }

  // --- MAIN CONTENT ---
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
        
        {/* TABLE DATA */}
        <Card className="border-none shadow-sm ring-1 ring-gray-200">
            <CardContent className="p-6">
                <DataTable 
                data={currentData}
                columns={columns}
                isLoading={isLoading}
                searchQuery=""
                // Student View hanya view data
                onSearchChange={() => {}} 
                isSearchVisible={false}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                startIndex={startIndex}
                endIndex={endIndex} 
                totalItems={dataList.length}
                />
            </CardContent>
        </Card>
    </div>
  );
}
