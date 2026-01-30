import React from "react";
import { auth } from "@/auth";
import { getStudentById, getAllStudentsForBiodata } from "@/app/actions/students";
import { redirect } from "next/navigation";
import BiodataClient from "./BiodataClient";

export const metadata = {
  title: "Biodata Mahasiswa",
};

export default async function BiodataPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  // 1. Mahasiswa View
  if (session.user.role === "mahasiswa") {
    if (!session.user.student_id) {
       return (
          <div className="p-8 text-center text-red-500">
              Data mahasiswa tidak ditemukan untuk akun ini.
          </div>
       );
    }
    const student = await getStudentById(session.user.student_id);
    if (!student) {
        return (
            <div className="p-8 text-center text-gray-500">
                Data mahasiswa tidak ditemukan. Silakan hubungi admin.
            </div>
        );
    }
    return <BiodataClient student={student} />;
  }

  // 2. Admin / Superuser / Staff View
  const students = await getAllStudentsForBiodata();
  return <BiodataClient students={students} />;
}
