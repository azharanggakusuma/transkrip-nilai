"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRightLeft, User, Crown } from "lucide-react";
import { switchToAccount } from "@/app/actions/switch-account";
import { toast } from "sonner";
import { UserData } from "@/lib/types";
import { Badge } from "@/components/ui/badge";

interface SwitchAccountButtonProps {
  user: UserData;
  currentUserId: string;
}

export function SwitchAccountButton({ user, currentUserId }: SwitchAccountButtonProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Jangan tampilkan tombol untuk user yang sedang aktif
  if (user.id === currentUserId) return null;

  const handleSwitch = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Sedang beralih akun...");
    try {
      const result = await switchToAccount(user.id);
      toast.success(result.message, { id: toastId });
      
      // Jangan tutup modal (setIsOpen(false)) agar user tidak melihat konten page "berubah"
      // sebelum redirect terjadi. Biarkan loading state tetap aktif sampai browser navigasi.
      
      // Redirect ke Dashboard setelah switch
      window.location.href = "/";
    } catch (error: any) {
      toast.error("Gagal switch account", {
        description: error.message,
        id: toastId,
      });
      setIsLoading(false);
    }
  };

  const getRoleBadge = () => {
    if (user.role === "admin") {
      return <Badge className="bg-black text-white">Admin</Badge>;
    } else if (user.role === "dosen") {
      return <Badge className="bg-blue-600 text-white">Dosen</Badge>;
    } else if (user.role === "mahasiswa") {
      return <Badge variant="outline" className="bg-white text-slate-600">Mahasiswa</Badge>;
    } else if (user.role === "superuser") {
      return <Badge className="bg-purple-600 text-white"><Crown className="h-3 w-3 mr-1" />Superuser</Badge>;
    }
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="text-purple-600 hover:bg-purple-50 h-8 w-8"
        onClick={() => setIsOpen(true)}
        title="Switch ke akun ini"
      >
        <ArrowRightLeft className="h-4 w-4" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ArrowRightLeft className="h-5 w-5 text-purple-600" />
              Konfirmasi Switch Account
            </DialogTitle>
            <DialogDescription>
              Anda akan berpindah ke akun berikut:
            </DialogDescription>
          </DialogHeader>

          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-slate-200 flex items-center justify-center">
                <User className="h-6 w-6 text-slate-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-900">{user.name}</p>
                <p className="text-sm text-slate-500">@{user.username}</p>
              </div>
              {getRoleBadge()}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
            <p className="font-medium mb-1">⚠️ Perhatian</p>
            <p className="text-xs">
              Anda akan masuk sebagai user ini. Untuk kembali ke akun superuser, 
              klik tombol "Kembali ke Superuser" di banner atas.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button
              onClick={handleSwitch}
              disabled={isLoading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? "Memproses..." : "Switch Account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
