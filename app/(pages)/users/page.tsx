"use client";

import React, { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { Pencil, Trash2, ShieldCheck } from "lucide-react"; // UserIcon dihapus karena tidak dipakai

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table"; 
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";

import { UserForm, type UserFormValues } from "@/components/features/users/UserForm";
import { getUsers, createUser, updateUser, deleteUser, type UserData } from "@/app/actions/users";

export default function UsersPage() {
  const [dataList, setDataList] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const users = await getUsers();
      setDataList(users);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // === FILTERING ===
  const filteredData = useMemo(() => {
    if (!searchQuery) return dataList;
    const lowerQuery = searchQuery.toLowerCase();
    return dataList.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerQuery) ||
        user.username.toLowerCase().includes(lowerQuery) ||
        user.role.toLowerCase().includes(lowerQuery)
    );
  }, [dataList, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  // === HANDLERS ===
  const handleOpenAdd = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (user: UserData) => {
    setSelectedUser(user);
    setIsEditing(true);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && selectedUser) {
        await updateUser(selectedUser.id, values);
        toast.success("Berhasil Update", { description: `User ${values.name} diperbarui.` });
      } else {
        await createUser(values);
        toast.success("Berhasil", { description: `User ${values.name} ditambahkan.` });
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (error: any) {
      toast.error("Gagal", { description: error.message });
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        toast.success("Dihapus", { description: "User berhasil dihapus." });
        if (currentData.length === 1 && currentPage > 1) setCurrentPage((p) => p - 1);
        await fetchData();
      } catch (error: any) {
        toast.error("Gagal Hapus", { description: error.message });
      }
    }
    setIsDeleteOpen(false);
  };

  // === COLUMNS ===
  const columns: Column<UserData>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
    },
    {
      header: "Nama User",
      // Render diubah: Menghapus icon, hanya menampilkan teks nama
      render: (row) => (
        <span className="font-semibold text-slate-700">{row.name}</span>
      ),
    },
    {
      header: "Username",
      className: "font-mono text-slate-600",
      render: (row) => row.username,
    },
    {
      header: "Role",
      className: "text-center",
      render: (row) => {
        const colors: Record<string, string> = {
          admin: "bg-purple-100 text-purple-700 border-purple-200",
          dosen: "bg-blue-100 text-blue-700 border-blue-200",
          mahasiswa: "bg-emerald-100 text-emerald-700 border-emerald-200",
        };
        const defaultColor = "bg-slate-100 text-slate-700 border-slate-200";
        
        return (
          <Badge variant="outline" className={`${colors[row.role] || defaultColor} capitalize`}>
            {row.role === 'admin' && <ShieldCheck size={12} className="mr-1" />}
            {row.role}
          </Badge>
        );
      },
    },
    {
      header: "Aksi",
      className: "text-center w-[120px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="text-amber-600 hover:bg-amber-50 h-8 w-8"
            onClick={() => handleOpenEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-600 hover:bg-rose-50 h-8 w-8"
            onClick={() => {
              setSelectedUser(row);
              setIsDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Manajemen Pengguna" breadcrumb={["Sistem", "Users"]} />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          <DataTable
            data={currentData}
            columns={columns}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onSearchChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            searchPlaceholder="Cari Nama atau Username..."
            onAdd={handleOpenAdd}
            addLabel="Tambah User"
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            startIndex={startIndex}
            endIndex={endIndex}
            totalItems={filteredData.length}
          />
        </CardContent>
      </Card>

      {/* MODAL FORM */}
      <FormModal
        isOpen={isFormOpen}
        onClose={setIsFormOpen}
        title={isEditing ? "Edit User" : "Tambah User Baru"}
        description={isEditing ? "Update informasi login pengguna." : "Buat akun baru untuk akses sistem."}
        maxWidth="sm:max-w-[500px]"
      >
        <UserForm
          key={isEditing && selectedUser ? `edit-${selectedUser.id}` : "add-new"}
          initialData={
            isEditing && selectedUser
              ? {
                  id: selectedUser.id,
                  name: selectedUser.name,
                  username: selectedUser.username,
                  role: selectedUser.role,
                  student_id: selectedUser.student_id,
                  password: "",
                }
              : undefined
          }
          isEditing={isEditing}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsFormOpen(false)}
        />
      </FormModal>

      {/* MODAL DELETE */}
      <ConfirmModal
        isOpen={isDeleteOpen}
        onClose={setIsDeleteOpen}
        onConfirm={handleDelete}
        title="Hapus User?"
        description={`Yakin ingin menghapus user "${selectedUser?.name}"? Akses login akan hilang permanen.`}
        confirmLabel="Hapus User"
        variant="destructive"
      />
    </div>
  );
}