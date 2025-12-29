// app/(pages)/nilai/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { Badge } from "@/components/ui/badge";
import { PencilLine } from "lucide-react";

// Imports
import { getStudents } from "@/app/actions/students"; // Gunakan list mahasiswa
import { getAllCourses, saveStudentGrades } from "@/app/actions/grades";
import { StudentData } from "@/lib/types";
import { StudentGradeForm } from "@/components/features/nilai/StudentGradeForm";

export default function NilaiPage() {
  const [studentList, setStudentList] = useState<StudentData[]>([]);
  const [coursesList, setCoursesList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch students (sudah include transcript mereka) dan all courses
      const [students, courses] = await Promise.all([
        getStudents(),
        getAllCourses()
      ]);
      
      setStudentList(students);
      setCoursesList(courses || []);
    } catch (error) {
      toast.error("Gagal Memuat Data", { description: "Terjadi kesalahan koneksi." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === FILTERING ===
  const filteredData = useMemo(() => {
    return studentList.filter((s) => {
      const q = searchQuery.toLowerCase();
      return (
        s.profile.nama.toLowerCase().includes(q) ||
        s.profile.nim.toLowerCase().includes(q) ||
        s.profile.prodi.toLowerCase().includes(q)
      );
    });
  }, [studentList, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === HANDLERS ===
  const handleOpenEdit = (student: StudentData) => {
    setSelectedStudent(student);
    setIsFormOpen(true);
  };

  const handleSaveGrades = async (studentId: number, grades: { course_id: number; hm: string }[]) => {
    await saveStudentGrades(studentId, grades);
    await fetchData(); // Refresh data untuk update tampilan tabel/IPK jika ada
    setIsFormOpen(false);
  };

  // === COLUMNS ===
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
        <div>
           <p className="font-semibold text-slate-800">{row.profile.nama}</p>
           <div className="flex gap-2 text-xs text-slate-500 mt-1">
             <span>{row.profile.prodi}</span>
             <span>•</span>
             <span>{row.profile.jenjang}</span>
           </div>
        </div>
      )
    },
    {
      header: "Semester",
      className: "w-[100px] text-center",
      render: (row) => <Badge variant="outline">Smt {row.profile.semester}</Badge>
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
            variant="default" 
            className="h-8 bg-blue-600 hover:bg-blue-700"
            onClick={() => handleOpenEdit(row)}
        >
            <PencilLine className="w-3 h-3 mr-2" />
            Kelola Nilai
        </Button>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Input Nilai Mahasiswa" breadcrumb={["SIAKAD", "Nilai"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Nama Mahasiswa / NIM..."
            // Remove onAdd prop karena kita tidak tambah mahasiswa dari sini
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredData.length}
          />
        </CardContent>
      </Card>

      {/* Modal Kelola Nilai Bertingkat */}
      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title="Input Kartu Hasil Studi"
        description="Kelola nilai mahasiswa berdasarkan semester."
        maxWidth="sm:max-w-[600px]"
      >
        {selectedStudent && (
            <StudentGradeForm 
                student={selectedStudent}
                allCourses={coursesList}
                onSubmit={handleSaveGrades}
                onCancel={() => setIsFormOpen(false)}
            />
        )}
      </FormModal>
    </div>
  );
}