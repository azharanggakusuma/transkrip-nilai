"use server";

import users from "@/lib/users.json";

export async function authenticate(formData: FormData) {
  // Simulasi delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { success: false, error: "Username dan Password wajib diisi." };
  }

  const user = users.find(
    (u) => u.username === username && u.password === password
  );

  if (user) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  }

  return { success: false, error: "Username atau Password salah." };
}