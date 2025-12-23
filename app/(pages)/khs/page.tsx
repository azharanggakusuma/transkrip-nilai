"use client";

import React, { useState, useEffect, useMemo } from "react";
import { students } from "@/lib/data";
import Header from "@/components/Header";
import StudentInfo from "@/components/StudentInfo";
import Footer from "@/components/Footer";
import ControlPanel from "@/components/ControlPanel";
import GradeTable from "@/components/GradeTable"; 
import { useSignature } from "@/hooks/useSignature";
import PageHeader from "@/components/PageHeader";

export default function KhsPage() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedSemester, setSelectedSemester] = useState<number>(1);
  const { signatureType, setSignatureType, secureImage } = useSignature("none");

  const currentStudent = students[selectedIndex];

  const availableSemesters = useMemo(() => {
    const smts = currentStudent.transcript.map((t) => t.smt);
    return [...new Set(smts)].sort((a, b) => a - b);
  }, [currentStudent]);

  useEffect(() => {
    if (availableSemesters.length > 0) {
      setSelectedSemester(availableSemesters[0]);
    }
  }, [selectedIndex, availableSemesters]);

  const semesterData = useMemo(() => {
    return currentStudent.transcript.filter((t) => t.smt === selectedSemester);
  }, [currentStudent, selectedSemester]);

  const cumulativeData = useMemo(() => {
    return currentStudent.transcript.filter((t) => t.smt <= selectedSemester);
  }, [currentStudent, selectedSemester]);

  const ips = useMemo(() => {
    const totalSKS = semesterData.reduce((acc, row) => acc + row.sks, 0);
    const totalNM = semesterData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace('.', ',') : "0,00";
  }, [semesterData]);

  const ipk = useMemo(() => {
    const totalSKS = cumulativeData.reduce((acc, row) => acc + row.sks, 0);
    const totalNM = cumulativeData.reduce((acc, row) => acc + row.nm, 0);
    return totalSKS > 0 ? (totalNM / totalSKS).toFixed(2).replace('.', ',') : "0,00";
  }, [cumulativeData]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col gap-8 w-full">
      <div className="print:hidden">
        <PageHeader 
          title="Kartu Hasil Studi" 
          breadcrumb={["SIAKAD", "KHS"]} 
        />
      </div>

      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 lg:gap-8 min-h-screen">
        {/* AREA KERTAS KHS */}
        {/* UPDATE 1: justify-center -> justify-start (Rata Kiri) */}
        <div className="flex-1 flex justify-start w-full lg:w-auto overflow-x-hidden lg:overflow-visible mb-[-600px] sm:mb-[-400px] md:mb-[-250px] lg:mb-0">
          
          {/* UPDATE 2: origin-top -> origin-top-left (Agar scale menempel ke kiri) */}
          <div className="bg-white p-8 sm:p-12 shadow-2xl border border-gray-300 print:shadow-none print:border-none print:p-0 print:m-0 w-[210mm] min-h-[297mm] origin-top-left transform scale-[0.4] sm:scale-[0.6] md:scale-[0.75] lg:scale-100 transition-transform duration-300">
            <Header title={`KARTU HASIL STUDI`} />
            <StudentInfo profile={currentStudent.profile} displaySemester={selectedSemester} />
            <GradeTable mode="khs" data={semesterData} ips={ips} ipk={ipk} />
            <Footer signatureType={signatureType} signatureBase64={secureImage} mode="khs" />
          </div>
        </div>

        {/* Control Panel */}
        {/* UPDATE 3: lg:w-80 -> lg:w-96 (Diperlebar) */}
        <div className="w-full lg:w-96 shrink-0 print:hidden lg:h-[calc(100vh-6rem)] lg:sticky lg:top-24 z-10 pb-10 lg:pb-0">
          <ControlPanel
            students={students}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
            signatureType={signatureType}
            onSignatureChange={setSignatureType}
            onPrint={handlePrint}
            showSemesterSelect={true}
            availableSemesters={availableSemesters}
            selectedSemester={selectedSemester}
            onSelectSemester={setSelectedSemester}
          />
        </div>
      </div>
    </div>
  );
}