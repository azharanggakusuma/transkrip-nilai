import React from "react";
import { getOfficials } from "@/app/actions/officials";
import OfficialsClient from "./OfficialsClient";

export default async function OfficialsPage() {
  const data = await getOfficials();

  return <OfficialsClient initialData={data} />;
}
