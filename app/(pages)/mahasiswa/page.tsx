import React from "react";
import { getStudents, getStudyPrograms } from "@/app/actions/students";
import MahasiswaClient from "./MahasiswaClient";

export default async function MahasiswaPage() {
  const [students, programs] = await Promise.all([
    getStudents(),
    getStudyPrograms()
  ]);

  return <MahasiswaClient initialStudents={students} initialPrograms={programs} />;
}