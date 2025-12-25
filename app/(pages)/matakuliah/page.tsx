"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Pencil, Trash2 } from "lucide-react";

// --- IMPORT KOMPONEN UI ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// --- IMPORT CUSTOM COMPONENTS ---
import { DataTable, type Column } from "@/components/DataTable";
import { FormModal } from "@/components/FormModal";
import { ConfirmModal } from "@/components/ConfirmModal";
import Tooltip from "@/components/Tooltip"; // <--- 1. Import Tooltip
import { toast } from "sonner"; // <--- 2. Import Toast

// --- IMPORT DATA ---
import { COURSES_DB, type CourseData as TCourseData, type CourseCategory } from "@/lib/data";

interface CourseState extends TCourseData {
  kode: string;
}

interface CourseFormState {
  kode: string;
  matkul: string;
  sks: number | string;
  smt_default: number | string;
  kategori: CourseCategory | "";
}

const DATA_FROM_DB: CourseState[] = Object.entries(COURSES_DB).map(([kode, data]) => ({
  kode,
  ...data
}));

export default function MataKuliahPage() {
  // --- STATE ---
  const [courses, setCourses] = useState<CourseState[]>(DATA_FROM_DB);
  const [searchQuery, setSearchQuery] = useState("");
  
  // FILTER STATE
  const [categoryFilter, setCategoryFilter] = useState<"ALL" | CourseCategory>("ALL");
  const [semesterFilter, setSemesterFilter] = useState<string>("ALL");

  // PAGINATION STATE
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // MODAL STATE (FORM)
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<CourseFormState>({
    kode: "", matkul: "", sks: "", smt_default: "", kategori: "",   
  });

  // MODAL STATE (DELETE)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteCode, setDeleteCode] = useState<string | null>(null);

  // --- LOGIC FILTER ---
  const filteredCourses = courses.filter((course) => {
    const matchSearch = 
      course.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.kode.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCategory = categoryFilter === "ALL" || course.kategori === categoryFilter;
    const matchSemester = semesterFilter === "ALL" || course.smt_default.toString() === semesterFilter;
    return matchSearch && matchCategory && matchSemester;
  });

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredCourses.slice(startIndex, endIndex);

  // --- COLUMNS ---
  const columns: Column<CourseState>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span>
    },
    { header: "Kode MK", accessorKey: "kode", className: "font-medium" },
    
    // --- UPDATE KOLOM MATA KULIAH (Tooltip & Truncate) ---
    { 
      header: "Mata Kuliah", 
      className: "max-w-[250px]", // Batasi lebar kolom
      render: (row) => (
        <Tooltip content={row.matkul} position="top">
          <div className="truncate text-gray-700 font-medium cursor-default">
            {row.matkul}
          </div>
        </Tooltip>
      ) 
    },
    // -----------------------------------------------------

    { header: "SKS", accessorKey: "sks", className: "text-center w-[100px] text-gray-700" },
    { header: "Semester", accessorKey: "smt_default", className: "text-center w-[100px] text-muted-foreground" },
    {
      header: "Kategori",
      accessorKey: "kategori",
      className: "w-[150px]",
      render: (row) => (
        <Badge variant="outline" className="font-normal border-gray-300 text-gray-600">
          {row.kategori}
        </Badge>
      )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" 
            onClick={() => handleOpenEdit(row)}
            title="Edit Data"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={() => handleDelete(row.kode)}
            title="Hapus Data"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData({ kode: "", matkul: "", sks: "", smt_default: "", kategori: "" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseState) => {
    setFormData({
      kode: course.kode,
      matkul: course.matkul,
      sks: course.sks,
      smt_default: course.smt_default,
      kategori: course.kategori
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (kode: string) => {
    setDeleteCode(kode);
    setIsDeleteOpen(true);
  };

  const confirmDelete = () => {
    if (deleteCode) {
      setCourses((prev) => prev.filter((item) => item.kode !== deleteCode));
      if (currentData.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      }
      // TOAST SUCCESS DELETE
      toast.success("Berhasil Dihapus", {
        description: `Mata kuliah ${deleteCode} telah dihapus permanen.`
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.sks === "" || formData.smt_default === "" || formData.kategori === "") {
      // TOAST ERROR
      toast.error("Gagal Menyimpan", {
        description: "Mohon lengkapi semua data mata kuliah."
      });
      return;
    }
    const finalData: CourseState = {
      kode: formData.kode,
      matkul: formData.matkul,
      sks: Number(formData.sks),
      smt_default: Number(formData.smt_default),
      kategori: formData.kategori as CourseCategory,
    };
    
    if (isEditing) {
      setCourses((prev) => prev.map((item) => (item.kode === finalData.kode ? finalData : item)));
      // TOAST SUCCESS EDIT
      toast.success("Data Diperbarui", {
        description: `Mata kuliah ${finalData.matkul} berhasil diupdate.`
      });
    } else {
      if (courses.some((c) => c.kode === finalData.kode)) {
        // TOAST ERROR DUPLIKAT
        toast.error("Gagal Menambahkan", {
          description: `Kode MK ${finalData.kode} sudah terdaftar!`
        });
        return;
      }
      setCourses((prev) => [...prev, finalData]);
      // TOAST SUCCESS ADD
      toast.success("Berhasil Ditambahkan", {
        description: `Mata kuliah baru ${finalData.matkul} telah disimpan.`
      });
    }
    setIsDialogOpen(false);
  };

  const filterContent = (
    <>
      <DropdownMenuLabel>Kategori</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={categoryFilter} onValueChange={(v) => { setCategoryFilter(v as any); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="Reguler">Reguler</DropdownMenuRadioItem>
        <DropdownMenuRadioItem value="MBKM">MBKM</DropdownMenuRadioItem>
      </DropdownMenuRadioGroup>
      <DropdownMenuSeparator />
      <DropdownMenuLabel>Semester</DropdownMenuLabel>
      <DropdownMenuRadioGroup value={semesterFilter} onValueChange={(v) => { setSemesterFilter(v); setCurrentPage(1); }}>
        <DropdownMenuRadioItem value="ALL">Semua</DropdownMenuRadioItem>
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <DropdownMenuRadioItem key={i} value={i.toString()}>Semester {i}</DropdownMenuRadioItem>)}
      </DropdownMenuRadioGroup>
    </>
  );

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Mata Kuliah" breadcrumb={["SIAKAD", "Mata Kuliah"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable 
            data={currentData}
            columns={columns}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            onAdd={handleOpenAdd}
            filterContent={filterContent}
            isFilterActive={categoryFilter !== "ALL" || semesterFilter !== "ALL"}
            onResetFilter={() => { setCategoryFilter("ALL"); setSemesterFilter("ALL"); setSearchQuery(""); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredCourses.length}
          />
        </CardContent>
      </Card>

      {/* FORM MODAL */}
      <FormModal
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        title={isEditing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}
        description="Lengkapi detail mata kuliah di bawah ini."
        onSubmit={handleSubmit}
        maxWidth="sm:max-w-[600px]"
      >
        <div className="grid gap-5 py-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="grid gap-2 col-span-2">
              <Label htmlFor="kode">Kode MK</Label>
              <Input id="kode" value={formData.kode} onChange={(e) => setFormData({ ...formData, kode: e.target.value })} disabled={isEditing} placeholder="Contoh: TKK-01" required />
            </div>
            <div className="grid gap-2 col-span-1">
              <Label htmlFor="sks">SKS</Label>
              <Input id="sks" type="number" min={0} max={6} value={formData.sks} onChange={(e) => setFormData({ ...formData, sks: e.target.value })} placeholder="0" required />
            </div>
            <div className="grid gap-2 col-span-1">
              <Label htmlFor="smt">Smt</Label>
              <Input id="smt" type="number" min={1} max={8} value={formData.smt_default} onChange={(e) => setFormData({ ...formData, smt_default: e.target.value })} placeholder="0" required />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="matkul">Nama Mata Kuliah</Label>
            <Input id="matkul" value={formData.matkul} onChange={(e) => setFormData({ ...formData, matkul: e.target.value })} placeholder="Contoh: Pemrograman Web Lanjut" required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="kategori">Kategori</Label>
            <Select value={formData.kategori} onValueChange={(val: CourseCategory) => setFormData({ ...formData, kategori: val })}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Pilih Kategori Mata Kuliah" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Reguler">Reguler</SelectItem>
                <SelectItem value="MBKM">MBKM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </FormModal>

      {/* CONFIRM DELETE MODAL */}
      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Mata Kuliah?"
        description={`Apakah Anda yakin ingin menghapus mata kuliah ${deleteCode}? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}