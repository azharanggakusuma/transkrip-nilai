import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudents } from "@/app/actions/students"; // Need to ensure getStudentByNim exists or use query
import { getCourses } from "@/app/actions/courses";
import { createClient } from "@/lib/supabase/server";

import {
  calculateIPK,
  calculateTotalSKSLulus,
  calculateSemesterTrend,
} from "@/lib/grade-calculations";

import { 
  calculateGradeDistribution,
  calculateSemesterTrend as calculateAdminTrend 
} from "@/lib/dashboard-helper";

import DashboardClient from "./DashboardClient";
import { StudentData } from "@/lib/types";

export default async function DashboardPage() {
  const user = await getSession();

  // Basic skeleton or redirect if no user, though middleware handles it
  if (!user) return null;

  let stats: any[] = [];
  let trendData: any[] = [];
  let gradeDistData = { counts: { A: 0, B: 0, C: 0, D: 0, E: 0 }, totalGrades: 0, totalAM: 0 };
  
  const isMahasiswa = user.role === "mahasiswa";
  const username = user.username; // Assuming username is NIM for students

  if (isMahasiswa) {
    // --- SERVER SIDE LOGIC FOR MAHASISWA ---
    // Fetch ONLY this student
    const supabase = await createClient(); // Or use specific action
    // Reuse existing action if available, or fetch directly.
    // existing `getStudents` returns ALL. We don't want that.
    // Let's assume we can fetch single student. using supabase client here is safe.
    
    // We need 'transcript' which is in JSONB column or joined? 
    // In `getStudents`: .select('*, study_program:study_programs(*)')
    
    // Let's use `getStudents` but we really should filter.
    // Since `getStudents` returns all, it's bad for perf if we just filter in JS.
    // But for now to fix LEAKAGE, fetching on server and filtering on server is "secure" (client doesn't see others), 
    // even if inefficient for server.
    // BETTER: Implement `getStudent(nim)` action or use Supabase directly here.
    
    const { data: myData } = await supabase
       .from("students")
       .select("*, study_program:study_programs(*)")
       .eq("nim", username)
       .single();

    if (myData) {
        // Cast to StudentData if compatible
        const student = myData as unknown as StudentData; 
        
        const myIPK = calculateIPK(student.transcript);
        const totalSKS = calculateTotalSKSLulus(student.transcript);
        trendData = calculateSemesterTrend(student.transcript);
        
        const currentSmt = student.profile.semester; 
        const totalMK = student.transcript.length;
        
        const jenjang = student.profile.study_program?.jenjang || "S1";
        const targetSKS = jenjang.includes("D3") ? 108 : 144;
        const sisaSKS = targetSKS - totalSKS;

        let deskripsiSKS = sisaSKS > 0 ? `${sisaSKS} SKS lagi untuk Lulus.` : "Syarat SKS Terpenuhi";

        stats = [
          {
            label: "Total IPK",
            value: myIPK, 
            description: "Skala Indeks 4.00", 
            iconType: "award",
            themeColor: "chart-1",
          },
          {
            label: "Total SKS Lulus",
            value: totalSKS.toString(),
            description: deskripsiSKS,
            iconType: "activity", 
            themeColor: "chart-2",
          },
          {
            label: "Mata Kuliah",
            value: totalMK.toString(),
            description: "Akumulasi Mata Kuliah Diambil", 
            iconType: "library",
            themeColor: "chart-3",
          },
          {
            label: "Semester",
            value: `${currentSmt}`,
            description: "Periode Akademik Aktif", 
            iconType: "calendar",
            themeColor: "chart-4",
          },
        ];
        
        gradeDistData = calculateGradeDistribution([student]);
    } else {
        // Fallback
         stats = [{ label: "Data Tidak Ditemukan", value: "-", description: "-", iconType: "users", themeColor: "chart-1" }];
    }

  } else {
    // --- SERVER SIDE LOGIC FOR ADMIN/DOSEN ---
    const [students, courses] = await Promise.all([
        getStudents(),
        getCourses()
    ]);

    const currentStudentCount = students.length;
    let totalIPK = 0;
    students.forEach((s) => {
        totalIPK += parseFloat(calculateIPK(s.transcript));
    });
    
    const avgIPK = currentStudentCount > 0 ? (totalIPK / currentStudentCount).toFixed(2) : "0.00";
    
    gradeDistData = calculateGradeDistribution(students);
    trendData = calculateAdminTrend(students);
    
    const avgGradePoint = gradeDistData.totalGrades > 0 ? (gradeDistData.totalAM / gradeDistData.totalGrades).toFixed(2) : "0.00";
    
    stats = [
        {
          label: "Total Mahasiswa",
          value: currentStudentCount.toLocaleString(),
          description: "Mahasiswa Terdaftar",
          iconType: "users", 
          themeColor: "chart-1",
        },
        {
          label: "Total Mata Kuliah",
          value: courses.length.toString(),
          description: "MK Dalam Kurikulum",
          iconType: "library", 
          themeColor: "chart-2",
        },
        {
          label: "Rata-rata Nilai Mutu",
          value: avgGradePoint,
          description: "Standar Mutu Akademik",
          iconType: "award", 
          themeColor: "chart-3",
        },
        {
          label: "Rata-rata IPK",
          value: avgIPK,
          description: "Rata-rata Mahasiswa",
          iconType: "trending", 
          themeColor: "chart-4",
        },
      ];
  }

  return (
    <DashboardClient 
        stats={stats} 
        trendData={trendData} 
        gradeDistData={gradeDistData} 
        role={user.role} 
    />
  );
}