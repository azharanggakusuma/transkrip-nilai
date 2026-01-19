import React from "react";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { getSession } from "@/app/actions/auth"; // Use server-side session
import { getStudents, getStudyPrograms } from "@/app/actions/students";
import { getStudentGradeSummary } from "@/app/actions/grades";

// Imports Views
import AdminNilaiView from "@/components/features/nilai/AdminNilaiView";
import StudentGradeView from "@/components/features/nilai/StudentGradeView";


export default async function NilaiPage() {
  const user = await getSession();
  // const user = session?.user; // Deleted this line as session IS the user

  // 1. Loading State (Menunggu User Session) - though likely fast on server
  if (!user) {
    // If no user, maybe redirect? For now, render skeleton or empty. 
    // Middleware should have caught this, but safe to check.
     return (
        <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
          <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
     );
  }

  // 2. Render View Based on Role with Server Data
  // Pre-fetch data based on role
  let initialStudents: any[] = [];
  let initialPrograms: any[] = [];
  let initialGrades: any[] = [];
  let initialSummary = { totalSKS: 0, totalNM: 0, ipk: "0.00" };

  if (user.role === 'mahasiswa' && user.student_id) {
    try {
        const res = await getStudentGradeSummary(user.student_id);
        initialGrades = res.grades;
        initialSummary = res.summary;
    } catch (e) {
        console.error("Failed to fetch student grades", e);
    }
  } else {
    // Admin / Dosen
    try {
        const [students, programs] = await Promise.all([
            getStudents(),
            getStudyPrograms()
        ]);
        initialStudents = students;
        initialPrograms = programs;
    } catch (e) {
        console.error("Failed to fetch admin data", e);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Nilai Mahasiswa" breadcrumb={["Beranda", "Nilai"]} />

      {user.role === 'mahasiswa' ? (
         <StudentGradeView user={user} initialGrades={initialGrades} initialSummary={initialSummary} />
      ) : (
         <AdminNilaiView initialStudents={initialStudents} initialPrograms={initialPrograms} />
      )}
    </div>
  );
}