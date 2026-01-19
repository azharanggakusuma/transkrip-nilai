import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getOfficialForDocument, getStudents, getStudyPrograms } from "@/app/actions/students";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import StudentKHSView from "@/components/features/khs/StudentKHSView";
import AdminKHSView from "@/components/features/khs/AdminKHSView";

export default async function KHSPage() {
  const user = await getSession();

  if (!user) {
    return null;
  }

  let studentData = null;
  let official = null;
  let allStudents: any[] = [];
  let studyPrograms: any[] = [];

  if (user.role === 'mahasiswa' && user.student_id) {
    try {
        studentData = await getStudentById(user.student_id);
        if (studentData?.profile?.study_program_id) {
            official = await getOfficialForDocument(studentData.profile.study_program_id);
        } else {
            official = await getOfficialForDocument();
        }
    } catch (e) {
        console.error("Failed to fetch student data for KHS", e);
    }
  } else {
    // Admin / Dosen
    try {
       const [s, p] = await Promise.all([
         getStudents(),
         getStudyPrograms()
       ]);
       allStudents = s;
       studyPrograms = p;
    } catch (e) {
       console.error("Failed to fetch admin data for KHS", e);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Kartu Hasil Studi" breadcrumb={["Beranda", "KHS"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentKHSView 
            initialStudentData={studentData}
            initialOfficial={official}
        />
      ) : (
        <AdminKHSView 
            initialStudents={allStudents}
            initialStudyPrograms={studyPrograms}
        />
      )}
    </div>
  );
}