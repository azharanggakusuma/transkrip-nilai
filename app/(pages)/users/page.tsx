"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { useToastMessage } from "@/hooks/use-toast-message"; // Menggunakan Hook
import { FormModal } from "@/components/shared/FormModal";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { UserForm } from "@/components/features/users/UserForm";
import UserTable from "@/components/features/users/UserTable";
import { ResetPasswordModal } from "@/components/features/users/ResetPasswordModal"; 
import { type UserData, type UserFormValues } from "@/lib/types";
import { getUsers, createUser, updateUser, deleteUser } from "@/app/actions/users";

export default function UsersPage() {
  // Init Hook
  const { successAction, confirmDeleteMessage, showError } = useToastMessage();

  const [dataList, setDataList] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  // === FETCH DATA ===
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const users = await getUsers();
      setDataList(users);
    } catch (error) {
      console.error(error);
      showError(
        "Gagal Memuat Data", 
        "Terjadi kesalahan saat mengambil data pengguna. Silakan coba muat ulang halaman."
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleOpenDelete = (user: UserData) => {
    setSelectedUser(user);
    setIsDeleteOpen(true);
  };

  const handleOpenReset = (user: UserData) => {
    setSelectedUser(user);
    setIsResetOpen(true);
  };

  const handleFormSubmit = async (values: UserFormValues) => {
    try {
      if (isEditing && selectedUser) {
        await updateUser(selectedUser.id, values);
        successAction("User", "update");
      } else {
        await createUser(values);
        successAction("User", "create");
      }
      setIsFormOpen(false);
      await fetchData();
    } catch (error: any) {
      // Menampilkan pesan error bersih dari server
      showError("Gagal Menyimpan", error.message);
    }
  };

  const handleDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUser(selectedUser.id);
        successAction("User", "delete");
        await fetchData();
      } catch (error: any) {
        showError("Gagal Menghapus", error.message);
      }
    }
    setIsDeleteOpen(false);
  };

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Data Pengguna" breadcrumb={["Beranda", "Users"]} />

      <UserTable 
        data={dataList}
        isLoading={isLoading}
        onAdd={handleOpenAdd}
        onEdit={handleOpenEdit}
        onDelete={handleOpenDelete}
        onResetPassword={handleOpenReset}
      />

      {/* MODAL ADD/EDIT */}
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
                  is_active: selectedUser.is_active,
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
        description={confirmDeleteMessage("User", selectedUser?.name)}
        confirmLabel="Hapus User"
        variant="destructive"
      />

      {/* MODAL RESET PASSWORD */}
      <ResetPasswordModal 
        isOpen={isResetOpen}
        onClose={setIsResetOpen}
        user={selectedUser}
      />
    </div>
  );
}