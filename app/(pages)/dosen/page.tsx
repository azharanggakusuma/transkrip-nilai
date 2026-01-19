import React from "react";
import { getLecturers } from "@/app/actions/lecturers";
import LecturersClient from "./LecturersClient";

export default async function LecturersPage() {
  const data = await getLecturers();

  return <LecturersClient initialData={data} />;
}
