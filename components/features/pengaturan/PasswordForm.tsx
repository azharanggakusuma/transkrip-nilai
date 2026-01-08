"use client";

import React, { useState } from "react";
import { ShieldCheck, Lock, KeyRound, AlertCircle, Check } from "lucide-react"; // Perbaikan: Tambahkan Check
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { updateUserSettings, logout } from "@/app/actions/auth";
import { type UserProfile } from "@/lib/types"; 

interface PasswordFormProps {
  user: UserProfile | null;
  onUpdateSuccess: (newPassword: string) => void;
}

export default function PasswordForm({ user, onUpdateSuccess }: PasswordFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  if (!user) return null;

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("Validasi Gagal", { description: "Konfirmasi kata sandi tidak cocok." }); return;
    }
    setIsSaving(true);
    try {
      await updateUserSettings(user.username, { password: passwordData.newPassword, role: user.role }, passwordData.currentPassword);
      toast.success("Berhasil", { description: "Password diubah. Silakan login kembali." });
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      onUpdateSuccess(passwordData.newPassword);
      setTimeout(async () => await logout(), 2000);
    } catch (error: any) {
      toast.error("Gagal Mengubah", { description: error.message || "Pastikan password lama benar." });
    } finally { setIsSaving(false); }
  };

  return (
    <Card className="h-full border-slate-200 shadow-md flex flex-col">
      <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-2 mb-1 text-slate-800">
          <ShieldCheck size={20} className="text-emerald-600" />
          <CardTitle className="text-base font-bold">Keamanan & Login</CardTitle>
        </div>
        <CardDescription className="text-xs">Kelola akses akun Anda.</CardDescription>
      </CardHeader>

      <form onSubmit={handlePasswordUpdate} className="flex-1 flex flex-col">
        <CardContent className="space-y-4 pt-6 flex-1">
          <div className="p-3 bg-amber-50 border border-amber-100 rounded-md flex gap-3">
             <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={16} />
             <p className="text-xs text-amber-800 leading-relaxed">
               Gunakan kombinasi huruf, angka, dan simbol untuk keamanan maksimal. Anda akan diminta login ulang setelah perubahan.
             </p>
          </div>

          <div className="space-y-3">
             <div className="space-y-1.5">
                <Label htmlFor="current_password" className="text-xs font-semibold text-slate-600">Password Lama</Label>
                <div className="relative">
                    <KeyRound size={14} className="absolute left-3 top-3 text-slate-400" />
                    <Input 
                        id="current_password" type="password" required className="pl-9 bg-slate-50 focus:bg-white transition-all"
                        placeholder="••••••••"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    />
                </div>
             </div>

             <div className="space-y-1.5 pt-2">
                <Label htmlFor="new_password" className="text-xs font-semibold text-slate-600">Password Baru</Label>
                <div className="relative">
                    <Lock size={14} className="absolute left-3 top-3 text-slate-400" />
                    <Input 
                        id="new_password" type="password" required className="pl-9"
                        placeholder="Minimal 6 karakter"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    />
                </div>
             </div>

             <div className="space-y-1.5">
                <Label htmlFor="confirm_password" className="text-xs font-semibold text-slate-600">Konfirmasi Password</Label>
                <div className="relative">
                    <Check size={14} className="absolute left-3 top-3 text-slate-400" />
                    <Input 
                        id="confirm_password" type="password" required className="pl-9"
                        placeholder="Ulangi password baru"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    />
                </div>
             </div>
          </div>
        </CardContent>

        <CardFooter className="bg-slate-50 border-t border-slate-100 p-4">
          <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white gap-2" disabled={isSaving}>
             {isSaving ? "Memproses..." : "Update Password"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}