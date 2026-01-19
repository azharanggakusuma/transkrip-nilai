import React from "react";
import { getStudyPrograms } from "@/app/actions/prodi";
import ProdiClient from "./ProdiClient";

export default async function ProdiPage() {
  const data = await getStudyPrograms();

  return <ProdiClient initialData={data} />;
}