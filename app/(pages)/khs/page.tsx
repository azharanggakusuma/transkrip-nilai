"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { getStudents } from "@/app/actions/students";
import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton"; // Import Skeleton

import PageHeader from "@/components/layout/PageHeader";
import DocumentHeader from "@/components/features/document/DocumentHeader";
import DocumentFooter from "@/components/features/document/DocumentFooter";
import StudentInfo from "@/components/features/document/StudentInfo";
import ControlPanel from "@/components/features/document/ControlPanel";
import GradeTable from "@/components/features/transkrip/GradeTable";

export default function KhsPage() {
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();
  
  const paperRef = useRef<HTMLDivElement>(null);
  const [totalPages, setTotalPages] = useState(1);

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Simulasi delay sedikit agar skeleton terlihat (opsional)
        // await new Promise(resolve => setTimeout(resolve, 1000));
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
  }, [currentStudent, selectedSemester]);

  const availableSemesters = useMemo(() => {
    if (!currentStudent) return [];
    // @ts-ignore
    const smts = currentStudent.transcript.map((t) => t.smt);
    // @ts-ignore
    return [...new Set(smts)].sort((a, b) => a - b);
  }, [currentStudent]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
      // @ts-ignore
      if (!availableSemesters.includes(selectedSemester)) {
         // @ts-ignore
        setSelectedSemester(availableSemesters[0]);
      }
    }
  }, [selectedIndex, availableSemesters]);

  const semesterData = useMemo(() => {
    if (!currentStudent) return [];
    // @ts-ignore
    return currentStudent.transcript.filter((t) => t.smt === selectedSemester);
  }, [currentStudent, selectedSemester]);

  const cumulativeData = useMemo(() => {
    if (!currentStudent) return [];
    // @ts-ignore
    return currentStudent.transcript.filter((t) => t.smt <= selectedSemester);
  }, [currentStudent, selectedSemester]);

  const ips = useMemo(() => {
    // @ts-ignore
    const totalSKS = semesterData.reduce((acc, row) => acc + row.sks, 0);
    // @ts-ignore
    const totalNM = semesterData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace(".", ",") : "0,00";
  }, [semesterData]);

  const ipk = useMemo(() => {
    // @ts-ignore
    const totalSKS = cumulativeData.reduce((acc, row) => acc + row.sks, 0);
    // @ts-ignore
    const totalNM = cumulativeData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace(".", ",") : "0,00";
  }, [cumulativeData]);

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["SIAKAD", "KHS"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        {/* === BAGIAN KERTAS (KHS) === */}
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
              // === LOADING SKELETON ===
              <div className="space-y-8 animate-pulse">
                {/* Header Skeleton */}
                <div className="flex items-center gap-4 border-b-2 border-double border-gray-200 pb-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4 mx-auto" />
                    <Skeleton className="h-4 w-1/2 mx-auto" />
                    <Skeleton className="h-4 w-1/3 mx-auto" />
                  </div>
                </div>

                {/* Info Mahasiswa Skeleton */}
                <div className="grid grid-cols-2 gap-x-12 gap-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-4 w-32" />
                </div>

                {/* Table Skeleton */}
                <div className="space-y-2 mt-4">
                   {/* Table Header */}
                   <Skeleton className="h-8 w-full bg-slate-200" />
                   {/* Table Rows */}
                   {Array.from({ length: 12 }).map((_, i) => (
                      <Skeleton key={i} className="h-6 w-full" />
                   ))}
                </div>

                 {/* Footer Skeleton */}
                 <div className="flex justify-end pt-8">
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-20 w-40" />
                        <Skeleton className="h-4 w-40" />
                    </div>
                 </div>
              </div>
            ) : !currentStudent ? (
              <div className="flex flex-col h-full items-center justify-center text-slate-400">
                <p>Data Mahasiswa Kosong</p>
              </div>
            ) : (
              // === REAL CONTENT ===
              <>
                <DocumentHeader title="KARTU HASIL STUDI" />
                <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
                <GradeTable mode="khs" data={semesterData} ips={ips} ipk={ipk} />
                <DocumentFooter signatureType={signatureType} signatureBase64={secureImage} mode="khs" />
              </>
            )}
          </div>
        </div>

        {/* === BAGIAN KONTROL PANEL (KANAN) === */}
        <div className="w-full flex-1 print:hidden z-10 pb-10 xl:pb-0">
          {loading ? (
             <div className="space-y-4">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-[100px] w-full rounded-xl" />
             </div>
          ) : (
            <ControlPanel
                students={studentsData}
                selectedIndex={selectedIndex}
                onSelect={setSelectedIndex}
                signatureType={signatureType}
                onSignatureChange={setSignatureType}
                onPrint={() => window.print()}
                showSemesterSelect={true}
                availableSemesters={availableSemesters}
                selectedSemester={selectedSemester}
                onSelectSemester={setSelectedSemester}
                totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}