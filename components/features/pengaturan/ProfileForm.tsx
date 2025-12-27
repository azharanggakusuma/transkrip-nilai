"use client";

import React, { useState } from "react";
import { User, Lock, Save } from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { updateUserSettings } from "@/app/actions/auth";

interface ProfileFormProps {
  user: any;
  onUpdateSuccess: (newData: any) => void;
}

export default function ProfileForm({ user, onUpdateSuccess }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  // State form menggunakan 'username'
  const [formData, setFormData] = useState({
    nama: user.name || "",
    username: user.username || "", 
    alamat: user.alamat || "",
  });

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Kirim username LAMA (user.username) dan data BARU ke server
      await updateUserSettings(user.username, {
        nama: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
        role: user.role,
      });

      toast.success("Profil berhasil diperbarui", {
        description: "Data identitas telah disimpan ke sistem.",
      });

      onUpdateSuccess({ 
        name: formData.nama, 
        username: formData.username, 
        alamat: formData.alamat 
      });

    } catch (error: any) {
      toast.error("Gagal menyimpan profil", {
        description: error.message || "Terjadi kesalahan sistem",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <Card className="flex flex-col h-full shadow-sm border-slate-200">
        <CardHeader className="pb-4 pt-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <CardTitle className="text-lg">Identitas Pengguna</CardTitle>
          </div>
          <CardDescription>
            Informasi akun yang terdaftar dalam sistem.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleProfileUpdate} className="flex flex-col flex-1">
          <CardContent className="space-y-5 flex-1">
            {/* Username */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-600">
                Username
              </Label>
              <div className="relative">
                <Input
                  id="username"
                  value={formData.username}
                  // Input aktif HANYA untuk Admin
                  disabled={user.role !== "admin"} 
                  onChange={(e) =>
                    setFormData({ ...formData, username: e.target.value })
                  }
                  className={`pl-3 border-slate-200 ${
                    user.role === "admin" 
                      ? "bg-white text-slate-900" 
                      : "bg-slate-50 text-slate-500"
                  }`}
                />
                {/* Icon Gembok hanya untuk User Biasa */}
                {user.role !== "admin" && (
                  <div className="absolute right-3 top-2.5">
                    <Lock size={14} className="text-slate-400" />
                  </div>
                )}
              </div>
              
              {/* UPDATE: Keterangan hanya muncul jika BUKAN admin */}
              {user.role !== "admin" && (
                <p className="text-[11px] text-slate-400 italic">
                  *Username dikelola oleh administrator dan tidak dapat diubah.
                </p>
              )}
            </div>

            {/* Nama Lengkap */}
            <div className="space-y-2">
              <Label htmlFor="nama" className="text-slate-700">
                Nama Lengkap
              </Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) =>
                  setFormData({ ...formData, nama: e.target.value })
                }
              />
            </div>

            {/* Alamat (Hanya untuk mahasiswa) */}
            {user?.role === "mahasiswa" && (
              <div className="space-y-2">
                <Label htmlFor="alamat" className="text-slate-700">
                  Alamat Domisili
                </Label>
                <Textarea
                  id="alamat"
                  rows={3}
                  className="resize-none"
                  value={formData.alamat}
                  onChange={(e) =>
                    setFormData({ ...formData, alamat: e.target.value })
                  }
                />
              </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
            <Button
              type="submit"
              disabled={isSaving}
              className="w-full sm:w-auto ml-auto gap-2"
            >
              <Save size={16} />
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}