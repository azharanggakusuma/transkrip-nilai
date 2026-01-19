import React from "react";
import { getMenus } from "@/app/actions/menus";
import MenusClient from "./MenusClient";

export default async function MenusPage() {
  const data = await getMenus();

  return <MenusClient initialData={data} />;
}