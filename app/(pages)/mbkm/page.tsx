import React from "react";
import { getSession } from "@/app/actions/auth";
import { getMbkmByStudentId, getMbkmStudents } from "@/app/actions/mbkm";
import { getStudents } from "@/app/actions/students";
import { getAcademicYears } from "@/app/actions/academic-years";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import StudentMbkmView from "@/components/features/mbkm/StudentMbkmView";
import AdminMbkmView from "@/components/features/mbkm/AdminMbkmView";

export default async function MbkmPage() {
  const user = await getSession();

  if (!user) {
    return (
        <div className="flex flex-col gap-4 p-4 md:p-8 animate-in fade-in">
          <PageHeader title="Data MBKM" breadcrumb={["Akademik", "MBKM"]} />
          <Skeleton className="h-10 w-1/3 mb-4" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
    );
  }

  let mbkmData: any[] = [];
  let students: any[] = [];
  let academicYears: any[] = [];

  if (user.role === 'mahasiswa' && user.student_id) {
    try {
        mbkmData = await getMbkmByStudentId(user.student_id);
    } catch (e) {
        console.error("Failed to fetch student MBKM data", e);
    }
  } else {
    // Admin / Dosen
    try {
       const [m, s, a] = await Promise.all([
         getMbkmStudents(),
         getStudents(),
         getAcademicYears()
       ]);
       mbkmData = m;
       students = s;
       academicYears = a;
    } catch (e) {
       console.error("Failed to fetch admin MBKM data", e);
    }
  }

  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader title="Data MBKM" breadcrumb={["Akademik", "MBKM"]} />
      
      {user.role === 'mahasiswa' ? (
          <StudentMbkmView initialData={mbkmData} />
      ) : (
          <AdminMbkmView 
             initialData={mbkmData}
             initialStudents={students}
             initialAcademicYears={academicYears}
          />
      )}
    </div>
  );
}