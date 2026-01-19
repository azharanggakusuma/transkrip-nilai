import React from "react";
import { getCourses } from "@/app/actions/courses";
import MataKuliahClient from "./MataKuliahClient";

export default async function MataKuliahPage() {
  const courses = await getCourses();

  return <MataKuliahClient initialData={courses} />;
}