import React from "react";
import { useLayout } from "@/app/context/LayoutContext";
import PageHeader from "@/components/layout/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import AdminKRSValidationView from "@/components/features/krs/AdminKRSValidationView";
import StudentKRSView from "@/components/features/krs/StudentKRSView";

import { getSession } from "@/app/actions/auth";
import { getAcademicYears } from "@/app/actions/academic-years";
import { getActiveOfficial } from "@/app/actions/students";
import { getStudentCourseOfferings, getStudentsWithSubmittedKRS } from "@/app/actions/krs";

export default async function KRSPage() {
  const user = await getSession();

  if (!user) {
    // Should be handled by middleware
    return null;
  }

  // Common Data
  const academicYears = await getAcademicYears();
  const activeYear = academicYears.find(y => y.is_active);
  const selectedYearId = activeYear ? activeYear.id : (academicYears.length > 0 ? academicYears[0].id : "");

  let initialDataStudent = null;
  let initialOfficial = null;
  let initialStudentsAdmin = [];
  
  if (user.role === 'mahasiswa' && user.student_id && selectedYearId) {
    try {
        const [krsData, official] = await Promise.all([
            getStudentCourseOfferings(user.student_id, selectedYearId),
            getActiveOfficial()
        ]);
        initialDataStudent = krsData;
        initialOfficial = official;
    } catch (e) {
        console.error("Failed to fetch student KRS data", e);
    }
  } else if (selectedYearId) {
    // Admin / Dosen
    try {
        initialStudentsAdmin = await getStudentsWithSubmittedKRS(selectedYearId);
    } catch (e) {
        console.error("Failed to fetch admin KRS data", e);
    }
  }

  return (
    <div className="pb-10">
      <PageHeader title="Kartu Rencana Studi" breadcrumb={["Beranda", "KRS"]} />
      
      {user.role === "mahasiswa" ? (
        <StudentKRSView 
            user={user} 
            initialAcademicYears={academicYears}
            initialOfficial={initialOfficial}
            initialSelectedYear={selectedYearId}
            initialData={initialDataStudent}
        />
      ) : (
        <AdminKRSValidationView 
            initialAcademicYears={academicYears}
            initialSelectedYear={selectedYearId}
            initialStudents={initialStudentsAdmin}
        />
      )}
    </div>
  );
}