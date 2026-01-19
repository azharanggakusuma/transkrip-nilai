"use client";

import React, { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import ProfileForm from "@/components/features/pengaturan/ProfileForm";
import PasswordForm from "@/components/features/pengaturan/PasswordForm";
import { UserProfile } from "@/lib/types"; 

interface SettingsClientProps {
  initialUser: UserProfile | null;
}

export default function SettingsClient({ initialUser }: SettingsClientProps) {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(initialUser);

  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="print:hidden">
        <PageHeader 
            title="Pengaturan Akun" 
            breadcrumb={["Beranda", "Pengaturan"]} 
        />
      </div>
      
      {/* Container Grid: items-stretch membuat kedua kolom sama tinggi */}
      <div className="grid gap-8 lg:grid-cols-12 items-stretch">
        
        {/* Kolom Kiri: Profil */}
        <div className="lg:col-span-7 xl:col-span-8 flex flex-col">
           <ProfileForm 
              user={currentUser} 
              onUpdateSuccess={(newData) => 
                  setCurrentUser((prev) => prev ? ({ ...prev, ...newData }) : null)
              } 
          />
        </div>

        {/* Kolom Kanan: Password */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col">
           <PasswordForm 
              user={currentUser} 
              onUpdateSuccess={(newPassword) => 
                  setCurrentUser((prev) => prev ? ({ ...prev, password: newPassword }) : null)
              }
          />
        </div>
      </div>
    </div>
  );
}
