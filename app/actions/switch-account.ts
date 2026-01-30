"use server";

import { auth } from "@/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const supabase = createAdminClient();

/**
 * Switch ke akun user lain (hanya untuk superuser)
 */
export async function switchToAccount(targetUserId: string) {
  const session = await auth();

  // Validasi: hanya superuser yang bisa switch
  if (!session?.user) {
    throw new Error("Unauthorized: Not logged in");
  }

  // Cek apakah sedang dalam mode switch, jika ya ambil original user
  const cookieStore = await cookies();
  const switchCookie = cookieStore.get("switch_account");
  let originalUserId = session.user.id;

  if (switchCookie) {
    try {
      const switchData = JSON.parse(switchCookie.value);
      originalUserId = switchData.originalUserId;
    } catch (e) {
      // Ignore parse error
    }
  }

  // Validasi role superuser
  const { data: originalUser } = await supabase
    .from("users")
    .select("role")
    .eq("id", originalUserId)
    .single();

  if (originalUser?.role !== "superuser") {
    throw new Error("Unauthorized: Only superuser can switch accounts");
  }

  // Ambil data user target dari database
  const { data: targetUser, error } = await supabase
    .from("users")
    .select("id, role, username, name, student_id, is_active")
    .eq("id", targetUserId)
    .single();

  if (error || !targetUser) {
    throw new Error("User not found");
  }

  if (!targetUser.is_active) {
    throw new Error("Cannot switch to inactive account");
  }

  // Simpan data switch di cookie
  const cookieStoreForSet = await cookies();
  cookieStoreForSet.set("switch_account", JSON.stringify({
    originalUserId: originalUserId,
    targetUserId: targetUser.id,
    targetRole: targetUser.role,
    targetName: targetUser.name,
    targetUsername: targetUser.username,
    targetStudentId: targetUser.student_id || null,
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24, // 24 jam
  });

  revalidatePath("/");

  return {
    success: true,
    message: `Berhasil switch ke akun ${targetUser.name} (${targetUser.role})`,
    needsReload: true,
  };
}

/**
 * Kembali ke akun superuser asli
 */
export async function switchBackToSuperuser() {
  const session = await auth();

  if (!session?.user) {
    throw new Error("Not logged in");
  }

  // Hapus cookie switch account
  const cookieStoreForDelete = await cookies();
  cookieStoreForDelete.delete("switch_account");

  revalidatePath("/");

  return {
    success: true,
    message: `Berhasil kembali ke akun superuser`,
    needsReload: true,
  };
}
