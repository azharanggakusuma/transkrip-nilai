import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import { Separator } from "@/components/ui/separator";

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Pengaturan" breadcrumb={["SIAKAD", "Pengaturan"]} />

      <div className="grid gap-8 lg:grid-cols-2 items-start">
        
        {/* --- SKELETON 1: PROFILE FORM (Mirip Tampilan Asli) --- */}
        <Card className="flex flex-col overflow-hidden border-none shadow-xl bg-white rounded-xl ring-1 ring-slate-100">
          
          {/* 1. Fake Banner Area (Gradient Placeholder) */}
          <div className="h-40 bg-slate-100 relative">
             <Skeleton className="w-full h-full bg-slate-200/50" />
          </div>

          <CardContent className="px-6 sm:px-8 pb-8">
            {/* 2. Avatar Overlapping & Name Info */}
            <div className="relative flex flex-col md:flex-row gap-6 items-center md:items-end -mt-16 mb-8">
                {/* Avatar Circle dengan Border Putih */}
                <div className="shrink-0 relative z-10">
                    <div className="rounded-full border-[5px] border-white bg-white shadow-md">
                        <Skeleton className="h-32 w-32 rounded-full" />
                    </div>
                </div>

                {/* Nama & Role Placeholder */}
                <div className="flex-1 text-center md:text-left space-y-3 pb-2 w-full md:w-auto flex flex-col items-center md:items-start">
                    <Skeleton className="h-8 w-48 bg-slate-200" /> {/* Nama */}
                    <Skeleton className="h-4 w-24" /> {/* Username */}
                    <Skeleton className="h-6 w-20 rounded-full" /> {/* Badge Role */}
                </div>
            </div>

            <Separator className="my-8 opacity-60" />

            {/* 3. Form Inputs Grid */}
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Username Input */}
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-20" /> {/* Label */}
                        <Skeleton className="h-11 w-full rounded-md" /> {/* Input Box */}
                        <Skeleton className="h-3 w-32" /> {/* Helper text */}
                    </div>
                    {/* Nama Input */}
                    <div className="space-y-3">
                        <Skeleton className="h-4 w-24" /> {/* Label */}
                        <Skeleton className="h-11 w-full rounded-md" /> {/* Input Box */}
                    </div>
                </div>

                {/* Alamat Input (Full Width) */}
                <div className="space-y-3">
                    <Skeleton className="h-4 w-28" /> {/* Label */}
                    <Skeleton className="h-28 w-full rounded-md" /> {/* Textarea */}
                </div>
            </div>

            {/* Tombol Simpan Mobile */}
            <div className="md:hidden mt-8 pt-4 border-t border-slate-100">
                 <Skeleton className="h-11 w-full rounded-md" />
            </div>
          </CardContent>
          
          {/* Footer Tombol Simpan Desktop */}
          <div className="hidden md:flex justify-end p-6 bg-slate-50/50 border-t border-slate-100">
             <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </Card>


        {/* --- SKELETON 2: PASSWORD FORM --- */}
        <Card className="flex flex-col h-full shadow-lg border-none ring-1 ring-slate-100 rounded-xl overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 pb-6">
            <div className="flex flex-col gap-2">
               <div className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-7 w-40" />
               </div>
               <Skeleton className="h-4 w-full max-w-[300px] mt-1" />
            </div>
          </CardHeader>

          <CardContent className="space-y-6 pt-8 flex-1">
            {/* Password Lama */}
            <div className="space-y-3">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-11 w-full" />
            </div>
            
            <div className="h-px bg-slate-100 my-2" />
            
            {/* Grid Password Baru */}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-11 w-full" />
              </div>
              <div className="space-y-3">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-11 w-full" />
              </div>
            </div>

            {/* Indikator Kekuatan Password (Alert Box style) */}
            <div className="pt-2">
                <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-6 mt-auto flex justify-end">
            <Skeleton className="h-10 w-36 rounded-md" />
          </CardFooter>
        </Card>

      </div>
    </div>
  );
}