"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
// Import getActiveOfficial
import { getStudents, getActiveAcademicYear, getActiveOfficial } from "@/app/actions/students";
import { type StudentData, type Official } from "@/lib/types";

import { useSignature } from "@/hooks/useSignature";
import { useLayout } from "@/app/context/LayoutContext";
import { Skeleton } from "@/components/ui/skeleton";

import PageHeader from "@/components/layout/PageHeader";
import ControlPanel from "@/components/features/document/ControlPanel";
import PrintableSuratKeterangan from "@/components/features/surat-keterangan/PrintableSuratKeterangan";

export default function SuratKeteranganPage() {
  const [studentsData, setStudentsData] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // State Data Dinamis
  const [official, setOfficial] = useState<Official | null>(null); // State pejabat
  
  // State Form
  const [nomorSurat, setNomorSurat] = useState(""); 
  const [tahunAkademik, setTahunAkademik] = useState(""); 
  const [tempatLahir, setTempatLahir] = useState("");
  const [tanggalLahir, setTanggalLahir] = useState("");
  const [alamat, setAlamat] = useState("");
  const [namaOrangTua, setNamaOrangTua] = useState("");
  const [pekerjaanOrangTua, setPekerjaanOrangTua] = useState("");

  const { signatureType, setSignatureType, secureImage } = useSignature("none");
  const { isCollapsed } = useLayout();
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Students, Tahun Akademik, dan Pejabat secara paralel
        const [students, activeYear, activeOfficial] = await Promise.all([
            getStudents(),
            getActiveAcademicYear(),
            getActiveOfficial()
        ]);

        setStudentsData(students);
        setOfficial(activeOfficial); // Simpan data pejabat (ID string/UUID aman)

        if (activeYear) {
            setTahunAkademik(activeYear.nama);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const currentStudent = useMemo(() => studentsData[selectedIndex], [studentsData, selectedIndex]);

  // Update Alamat saat mahasiswa berganti
  useEffect(() => {
    if (currentStudent?.profile?.alamat) {
      setAlamat(currentStudent.profile.alamat);
    } else {
      setAlamat("");
    }
  }, [currentStudent]);



  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Surat Keterangan" breadcrumb={["Beranda", "Surat Keterangan"]} />
      </div>

      <div className="flex flex-col xl:flex-row items-stretch justify-start gap-6 min-h-screen">
        <PrintableSuratKeterangan
          loading={loading}
          currentStudent={currentStudent}
          official={official}
          nomorSurat={nomorSurat}
          tahunAkademik={tahunAkademik}
          tempatLahir={tempatLahir}
          tanggalLahir={tanggalLahir}
          alamat={alamat}
          namaOrangTua={namaOrangTua}
          pekerjaanOrangTua={pekerjaanOrangTua}
          signatureType={signatureType}
          signatureBase64={secureImage}
          isCollapsed={isCollapsed}
          setTotalPages={setTotalPages}
        />

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
              onPrint={() => window.print()}
              
              nomorSurat={nomorSurat} setNomorSurat={setNomorSurat}
              tahunAkademik={tahunAkademik} setTahunAkademik={setTahunAkademik}
              tempatLahir={tempatLahir} setTempatLahir={setTempatLahir}
              tanggalLahir={tanggalLahir} setTanggalLahir={setTanggalLahir}
              alamat={alamat} setAlamat={setAlamat}
              namaOrangTua={namaOrangTua} setNamaOrangTua={setNamaOrangTua}
              pekerjaanOrangTua={pekerjaanOrangTua} setPekerjaanOrangTua={setPekerjaanOrangTua}
              totalPages={totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
}