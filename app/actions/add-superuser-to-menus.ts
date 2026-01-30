"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { revalidatePath } from "next/cache";

/**
 * Menambahkan role superuser ke semua menu yang belum memilikinya
 */
export async function addSuperuserToAllMenus() {
  const supabase = createAdminClient();

  try {
    // Ambil semua menu dari database
    const { data: menus, error: fetchError } = await supabase
      .from("menus")
      .select("id, label, allowed_roles");

    if (fetchError) {
      throw new Error("Gagal mengambil data menu: " + fetchError.message);
    }

    if (!menus || menus.length === 0) {
      return {
        success: true,
        message: "Tidak ada menu yang perlu diupdate.",
        updated: 0,
      };
    }

    // Filter menu yang belum punya superuser di allowed_roles
    const menusToUpdate = menus.filter(
      (menu) => !menu.allowed_roles.includes("superuser")
    );

    if (menusToUpdate.length === 0) {
      return {
        success: true,
        message: "Semua menu sudah memiliki akses superuser.",
        updated: 0,
      };
    }

    // Update setiap menu untuk menambahkan superuser
    const updatePromises = menusToUpdate.map((menu) => {
      const updatedRoles = [...menu.allowed_roles, "superuser"];
      return supabase
        .from("menus")
        .update({ allowed_roles: updatedRoles })
        .eq("id", menu.id);
    });

    await Promise.all(updatePromises);

    revalidatePath("/menus");

    return {
      success: true,
      message: `Berhasil menambahkan akses superuser ke ${menusToUpdate.length} menu.`,
      updated: menusToUpdate.length,
    };
  } catch (error: any) {
    console.error("Error adding superuser to menus:", error);
    throw new Error(error.message || "Gagal menambahkan superuser ke menu.");
  }
}
