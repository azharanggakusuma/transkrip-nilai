import React from "react";
import { getSession } from "@/app/actions/auth";
import { getStudentById, getOfficialForDocument, getStudents, getStudyPrograms } from "@/app/actions/students";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/layout/PageHeader";
import StudentTranskripView from "@/components/features/transkrip/StudentTranskripView";
import AdminTranskripView from "@/components/features/transkrip/AdminTranskripView";

export default async function TranskripPage() {
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
        console.error("Failed to fetch student data for Transkrip", e);
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
       console.error("Failed to fetch admin data for Transkrip", e);
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      <div className="print:hidden">
        <PageHeader title="Transkrip Nilai" breadcrumb={["Beranda", "Transkrip"]} />
      </div>

      {user.role === "mahasiswa" ? (
        <StudentTranskripView 
            initialStudentData={studentData}
            initialOfficial={official}
        />
      ) : (
        <AdminTranskripView 
            initialStudents={allStudents}
            initialStudyPrograms={studyPrograms}
        />
      )}
    </div>
  );
}