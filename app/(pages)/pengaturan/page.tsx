"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { toast } from "sonner";
import { getSession, getUserSettings } from "@/app/actions/auth";

// Import komponen yang sudah dipecah
import SettingsSkeleton from "@/components/features/pengaturan/SettingsSkeleton";
import ProfileForm from "@/components/features/pengaturan/ProfileForm";
import PasswordForm from "@/components/features/pengaturan/PasswordForm";

export default function PengaturanPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // === 1. Fetch Data User ===
  useEffect(() => {
    const initData = async () => {
      try {
        const session = await getSession();

        if (!session) {
          router.push("/login");
          return;
        }

        const userData = await getUserSettings(session.username);
        
        if (userData) {
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error("Gagal memuat profil:", error);
        toast.error("Gagal memuat data pengguna.");
      } finally {
        // Sedikit delay agar transisi skeleton lebih halus
        setTimeout(() => setIsLoading(false), 300);
      }
    };

    initData();
  }, [router]);

  // === 2. Render Loading ===
  if (isLoading) {
    return <SettingsSkeleton />;
  }

  // === 3. Render Utama ===
  return (
    <div className="flex flex-col gap-10 pb-10">
      <PageHeader 
        title="Pengaturan" 
        breadcrumb={["SIAKAD", "Pengaturan"]} 
      />
      
      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        
        {/* Komponen Profil */}
        <ProfileForm 
            user={currentUser} 
            onUpdateSuccess={(newData) => 
                setCurrentUser((prev: any) => ({ ...prev, ...newData }))
            } 
        />

        {/* Komponen Password */}
        <PasswordForm 
            user={currentUser} 
            onUpdateSuccess={(newPassword) => 
                setCurrentUser((prev: any) => ({ ...prev, password: newPassword }))
            }
        />

      </div>
    </div>
  );
}