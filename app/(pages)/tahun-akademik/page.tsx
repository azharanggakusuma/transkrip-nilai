"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message";
import { Pencil, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { AcademicYearForm } from "@/components/features/academic-year/AcademicYearForm";
import { AcademicYear, AcademicYearFormValues } from "@/lib/types";
import { getAcademicYears, createAcademicYear, updateAcademicYear, deleteAcademicYear } from "@/app/actions/academic-years";

export default function AcademicYearPage() {
  const { successAction, confirmDeleteMessage, showError, showLoading } = useToastMessage();

  const [dataList, setDataList] = useState<AcademicYear[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [deleteName, setDeleteName] = useState<string>(""); 
  const [formData, setFormData] = useState<AcademicYearFormValues | undefined>(undefined);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await getAcademicYears();
      setDataList(data);
    } catch (error) {
      console.error(error);
      showError("Gagal Memuat Data", "Terjadi kendala saat mengambil data tahun akademik.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- FILTER LOGIC ---
  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      const matchSearch = 
        item.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.semester.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSearch;
    });
  }, [dataList, searchQuery]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage; 
  const currentData = filteredData.slice(startIndex, endIndex);

  // --- HANDLERS ---
  const handleOpenAdd = () => {
    setFormData(undefined);
    setSelectedId(null);
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (item: AcademicYear) => {
    setSelectedId(item.id); 
    setFormData({
      nama: item.nama,
      semester: item.semester,
      is_active: item.is_active
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (item: AcademicYear) => {
    setSelectedId(item.id);
    setDeleteName(`${item.nama} - ${item.semester}`);
    setIsDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      const toastId = showLoading("Menghapus data..."); 
      try {
        await deleteAcademicYear(selectedId);
        successAction("Tahun Akademik", "delete", toastId);
        
        if (currentData.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        }
        await fetchData();
      } catch (error: any) {
        showError("Gagal Menghapus", error.message, toastId);
      }
    }
    setIsDeleteOpen(false);
  };

  const handleFormSubmit = async (values: AcademicYearFormValues) => {
    setIsSaving(true);
    const toastId = showLoading("Menyimpan data...");

    try {
      if (isEditing && selectedId) {
        await updateAcademicYear(selectedId, values);
        successAction("Tahun Akademik", "update", toastId);
      } else {
        await createAcademicYear(values);
        successAction("Tahun Akademik", "create", toastId);
      }
      await fetchData();
      setIsDialogOpen(false);
    } catch (error: any) {
      showError("Gagal Menyimpan", error.message, toastId);
    } finally {
      setIsSaving(false);
    }
  };

  // --- COLUMNS ---
  const columns: Column<AcademicYear>[] = [
    { 
      header: "#", 
      className: "w-[50px] text-center", 
      render: (_, index) => <span className="text-muted-foreground font-medium">{startIndex + index + 1}</span> 
    },
    { 
      header: "Tahun Akademik", 
      accessorKey: "nama", 
      className: "font-medium" 
    },
    { 
      header: "Semester", 
      accessorKey: "semester",
      className: "w-[150px]",
    },
    {
      header: "Status",
      accessorKey: "is_active",
      className: "w-[150px] text-center",
      render: (row) => (
        <div className="flex justify-center">
            {row.is_active ? (
                <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200 gap-1 pl-1.5 pr-2.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Aktif
                </Badge>
            ) : (
                <Badge variant="outline" className="text-muted-foreground bg-gray-50 gap-1 pl-1.5 pr-2.5">
                    <XCircle className="w-3.5 h-3.5" />
                    Tidak Aktif
                </Badge>
            )}
        </div>
      )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex items-center justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" onClick={() => handleOpenEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50" 
            onClick={() => handleDelete(row)} 
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Tahun Akademik" breadcrumb={["Beranda", "Tahun Akademik"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable 
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            searchPlaceholder="Cari Tahun/Semester..."
            onAdd={handleOpenAdd}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex} 
            totalItems={filteredData.length}
          />
        </CardContent>
      </Card>

      <FormModal
        isOpen={isDialogOpen}
        onClose={setIsDialogOpen}
        title={isEditing ? "Edit Tahun Akademik" : "Tambah Tahun Akademik"}
        description={isEditing ? "Perbarui informasi tahun akademik." : "Tambahkan periode tahun akademik baru."}
        maxWidth="sm:max-w-[500px]"
      >
        <AcademicYearForm
            key={isEditing && selectedId ? `edit-${selectedId}` : "create-new"} 
            initialData={formData}
            isEditing={isEditing}
            isLoading={isSaving}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsDialogOpen(false)}
        />
      </FormModal>

      <ConfirmModal 
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={confirmDelete}
        title="Hapus Tahun Akademik?"
        description={confirmDeleteMessage("Tahun Akademik", deleteName)}
        confirmLabel="Hapus Permanen"
        variant="destructive"
      />
    </div>
  );
}