import React from "react";
import { getAcademicYears } from "@/app/actions/academic-years";
import AcademicYearClient from "./AcademicYearClient";

export default async function AcademicYearPage() {
  const data = await getAcademicYears();

  return <AcademicYearClient initialData={data} />;
}