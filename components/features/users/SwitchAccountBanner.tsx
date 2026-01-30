"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeftRight, LogOut } from "lucide-react";
import { switchBackToSuperuser } from "@/app/actions/switch-account";
import { toast } from "sonner";

interface SwitchAccountBannerProps {
  isSwitched: boolean;
  currentUserName: string;
  currentUserRole: string;
}

export function SwitchAccountBanner({ 
  isSwitched, 
  currentUserName, 
  currentUserRole 
}: SwitchAccountBannerProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!isSwitched) return null;

  const handleSwitchBack = async () => {
    setIsLoading(true);
    const toastId = toast.loading("Mengembalikan ke akun superuser...");
    try {
      const result = await switchBackToSuperuser();
      toast.success(result.message, { id: toastId });
      
      // Redirect kembali ke halaman Users
      window.location.href = "/users";
    } catch (error: any) {
      toast.error("Gagal kembali ke akun superuser", {
        description: error.message,
        id: toastId,
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-purple-600 text-white px-4 py-3 shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ArrowLeftRight className="h-5 w-5" />
          <div>
            <p className="text-sm font-medium">
              Mode Switch Account Aktif
            </p>
            <p className="text-xs opacity-90">
              Saat ini sebagai: <span className="font-semibold">{currentUserName}</span> ({currentUserRole})
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          onClick={handleSwitchBack}
          disabled={isLoading}
          className="bg-white text-purple-600 hover:bg-purple-50"
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoading ? "Memproses..." : "Kembali ke Superuser"}
        </Button>
      </div>
    </div>
  );
}
