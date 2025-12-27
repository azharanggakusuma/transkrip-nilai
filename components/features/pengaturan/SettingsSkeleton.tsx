import React from "react";
import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";

export default function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-10 pb-10">
      <PageHeader title="Pengaturan" breadcrumb={["SIAKAD", "Pengaturan"]} />

      <div className="grid gap-6 lg:grid-cols-2 items-stretch">
        {/* Skeleton Kartu Identitas */}
        <Card className="flex flex-col h-full shadow-sm border-slate-200">
          <CardHeader className="pb-4 pt-4">
            <div className="flex items-center gap-3 mb-1">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-6 w-40" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>

          <CardContent className="space-y-5 flex-1">
            <div className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-24 w-full" />
            </div>
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
            <Skeleton className="h-10 w-36 ml-auto" />
          </CardFooter>
        </Card>

        {/* Skeleton Kartu Password */}
        <Card className="flex flex-col h-full shadow-sm border-slate-200">
          <CardHeader className="pb-4 pt-4">
            <div className="flex items-center gap-3 mb-1">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-6 w-48" />
            </div>
            <Skeleton className="h-4 w-64 mt-2" />
          </CardHeader>

          <CardContent className="space-y-5 flex-1">
            <div className="space-y-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="h-px bg-slate-100 my-2" />
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
            <Skeleton className="h-10 w-40 ml-auto" />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}