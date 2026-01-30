import React from "react";
import { getUsers } from "@/app/actions/users";
import { auth } from "@/auth";
import UsersClient from "./UsersClient";

export default async function UsersPage() {
  const users = await getUsers();
  const session = await auth();

  return (
    <UsersClient 
      initialData={users} 
      currentUserId={session?.user?.id}
      currentUserRole={session?.user?.role}
    />
  );
}