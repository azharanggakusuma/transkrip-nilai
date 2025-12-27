"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { getStudents } from "@/app/actions/students";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/layout/PageHeader";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import StudentInfo from "@/components/features/document/StudentInfo";
import ControlPanel from "@/components/features/document/ControlPanel";
import GradeTable from "@/components/features/transkrip/GradeTable";

export default function TranskripPage() {
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();

  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getStudents();
        setStudentsData(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  useEffect(() => {
    if (!paperRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const pages = Math.ceil((entry.target.scrollHeight - 1) / 1122.5);
        setTotalPages(pages < 1 ? 1 : pages);
      }
    });
    observer.observe(paperRef.current);
    return () => observer.disconnect();
  }, [currentStudent]); 

  const handlePrint = () => window.print();

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Transkrip Nilai" breadcrumb={["SIAKAD", "Transkrip"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        <div className={`
            hidden xl:flex print:flex print:w-full print:justify-center
            shrink-0 justify-start w-full transition-all duration-300
            ${isCollapsed ? "xl:w-[210mm]" : "xl:w-[189mm]"}
            overflow-visible mb-0 
        `}>
          <div ref={paperRef} className={`
              bg-white p-8 shadow-2xl border border-gray-300 
              print:shadow-none print:border-none print:m-0 
              w-[210mm] min-h-[297mm] origin-top-left transform transition-transform duration-300
              ${isCollapsed ? "xl:scale-100" : "xl:scale-[0.9]"}
              print:scale-100
            `}>
             
             {loading ? (
              // === CUSTOM SKELETON (MATCHING DOCUMENT SHAPE) ===
              <div className="animate-pulse flex flex-col h-full">
                
                {/* 1. Header Area */}
                <div className="grid grid-cols-[1fr_auto] gap-4 mb-1">
                    <div className="flex items-center gap-3">
                        <Skeleton className="w-[80px] h-[80px]" /> 
                        <div className="flex flex-col gap-2">
                            <Skeleton className="h-3 w-48" />
                            <Skeleton className="h-8 w-32" />
                            <Skeleton className="h-4 w-24" />
                        </div>
                    </div>
                    <Skeleton className="w-[250px] h-[78px]" />
                </div>

                {/* Bar Warna */}
                <Skeleton className="h-[26px] w-full mt-1" />
                <Skeleton className="h-[26px] w-full mt-1" />

                {/* Judul */}
                <div className="flex justify-center my-6">
                    <Skeleton className="h-6 w-48" />
                </div>

                {/* 2. Info Mahasiswa */}
                <div className="grid grid-cols-[120px_10px_1fr] gap-y-2 mb-6">
                    <Skeleton className="h-3 w-full" /> <div/> <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-3 w-full" /> <div/> <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-full" /> <div/> <Skeleton className="h-3 w-56" />
                    <Skeleton className="h-3 w-full" /> <div/> <Skeleton className="h-3 w-16" />
                </div>

                {/* 3. Tabel Skeleton */}
                <div className="space-y-1 mb-4 flex-1">
                    {/* Header Tabel */}
                    <Skeleton className="h-6 w-full bg-slate-200" />
                    {/* Baris Data (Transkrip biasanya lebih panjang) */}
                    {Array.from({ length: 18 }).map((_, i) => (
                        <Skeleton key={i} className="h-4 w-full" />
                    ))}
                    {/* Footer Tabel (Total SKS/IPK) */}
                     <div className="pt-2 space-y-1">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                </div>

                {/* 4. Footer Dokumen */}
                <div className="flex justify-between items-start mt-4">
                    <div className="space-y-2">
                         <Skeleton className="h-3 w-20 mb-2" />
                         <Skeleton className="h-2 w-32" />
                         <Skeleton className="h-2 w-32" />
                         <Skeleton className="h-2 w-32" />
                    </div>
                    
                    <div className="flex flex-col items-center gap-1 w-[200px]">
                         <Skeleton className="h-3 w-32" />
                         <Skeleton className="h-3 w-40" />
                         <Skeleton className="h-20 w-32 my-2" />
                         <Skeleton className="h-3 w-40" />
                         <Skeleton className="h-3 w-32" />
                    </div>
                </div>

              </div>
            ) : !currentStudent ? (
              <div className="flex flex-col h-full items-center justify-center text-slate-400">
                <p>Data Transkrip Kosong</p>
              </div>
            ) : (
              <>
                 <DocumentHeader title="TRANSKRIP NILAI" />
                 <StudentInfo profile={currentStudent.profile} />
                 <GradeTable data={currentStudent.transcript} mode="transkrip" />
                 <DocumentFooter signatureType={signatureType} signatureBase64={secureImage} mode="transkrip" />
              </>
            )}
          </div>
        </div>

        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-[240px] w-full rounded-xl" />
                <Skeleton className="h-[120px] w-full rounded-xl" />
             </div>
          ) : (
            <ControlPanel
                students={studentsData}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                signatureType={signatureType}
                onSignatureChange={setSignatureType}
                onPrint={handlePrint}
                totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}