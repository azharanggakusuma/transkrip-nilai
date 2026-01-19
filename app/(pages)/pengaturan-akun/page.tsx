import React from "react";
import { redirect } from "next/navigation";
import { getSession, getUserSettings } from "@/app/actions/auth";
import SettingsClient from "./SettingsClient";
import { UserProfile } from "@/lib/types";

export default async function PengaturanPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  let userProfile: UserProfile | null = null;
  try {
     const data = await getUserSettings(session.username);
     if (data) {
        userProfile = data as UserProfile;
     }
  } catch (e) {
     console.error("Failed to fetch user settings", e);
  }

  return <SettingsClient initialUser={userProfile} />;
}