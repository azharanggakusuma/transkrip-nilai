import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getOfficialForDocument, getStudents, getActiveAcademicYear } from "@/app/actions/students";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import StudentSuratView from "@/components/features/surat-keterangan/StudentSuratView";
import AdminSuratView from "@/components/features/surat-keterangan/AdminSuratView";

export default async function SuratKeteranganPage() {
  const user = await getSession();

  if (!user) {
    return (
       <div className="flex flex-col gap-6 w-full p-8">
         <PageHeader title="Surat Keterangan" breadcrumb={["Beranda", "Surat Keterangan"]} />
         <Skeleton className="h-[500px] w-full rounded-xl" />
       </div>
    );
  }

  let studentData = null;
  let official = null;
  let allStudents: any[] = [];
  let academicYearName = "";

  const activeYear = await getActiveAcademicYear();
  if (activeYear) {
    academicYearName = activeYear.nama;
  }

  if (user.role === 'mahasiswa' && user.student_id) {
    try {
        studentData = await getStudentById(user.student_id);
        if (studentData?.profile?.study_program_id) {
            official = await getOfficialForDocument(studentData.profile.study_program_id);
        } else {
            official = await getOfficialForDocument();
        }
    } catch (e) {
        console.error("Failed to fetch student data for Surat Keterangan", e);
    }
  } else {
    // Admin / Dosena
    try {
       allStudents = await getStudents();
    } catch (e) {
       console.error("Failed to fetch admin data for Surat Keterangan", e);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Surat Keterangan" breadcrumb={["Beranda", "Surat Keterangan"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentSuratView 
            initialStudentData={studentData}
            initialAcademicYear={academicYearName}
            initialOfficial={official}
        />
      ) : (
        <AdminSuratView 
            initialStudents={allStudents}
            initialAcademicYear={academicYearName}
        />
      )}
    </div>
  );
}