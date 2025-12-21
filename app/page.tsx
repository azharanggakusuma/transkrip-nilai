import React from "react";
import { transcriptData } from "../lib/data";
import Header from "../components/Header";
import StudentInfo from "../components/StudentInfo";
import GradeTable from "../components/GradeTable";
import Footer from "../components/Footer";

export default function TranskripPage() {
  return (
    // Wrapper luar untuk background abu-abu saat preview di layar
    <div className="min-h-screen bg-gray-100 p-8 font-['Cambria'] text-black flex justify-center print:p-0 print:bg-white">
      
      {/* Container A4 Style: Lebar 210mm x Tinggi Minimal 297mm */}
      <div className="w-[210mm] min-h-[297mm] bg-white p-8 shadow-lg relative print:shadow-none print:w-full print:m-0">
        
        {/* Components */}
        <Header />
        <StudentInfo />
        <GradeTable data={transcriptData} />
        <Footer />

      </div>
    </div>
  );
}