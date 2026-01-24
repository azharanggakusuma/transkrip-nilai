import { createClient } from "@/lib/supabase/server";
import { getMaintenanceStatus } from "./maintenance";

export type SystemSettings = {
  maintenance_mode: boolean;
  turnstile_enabled: boolean;
};

/**
 * Mengambil semua pengaturan sistem.
 * Menggabungkan logic maintenance mode (env priority) dan settings lain dari DB.
 */
export async function getSystemSettings(): Promise<SystemSettings> {
  // Logic maintenance mode sudah handle env priority
  const maintenance_mode = await getMaintenanceStatus();

  try {
    const supabase = await createClient();
    // Gunakan select('*') agar tidak error jika kolom `turnstile_enabled` belum dibuat
    const { data } = await supabase
      .from("system_settings")
      .select("*")
      .eq("id", "global")
      .single();

    return {
      maintenance_mode,
      // Default true jika kolom belum ada atau null
      turnstile_enabled: data?.turnstile_enabled ?? true,
    };
  } catch (error) {
    console.warn("Gagal mengambil turnstile_enabled, default to true:", error);
    return {
      maintenance_mode,
      turnstile_enabled: true
    };
  }
}

/**
 * Helper untuk mengecek status turnstile saja
 */
export async function isTurnstileEnabled(): Promise<boolean> {
  const settings = await getSystemSettings();
  return settings.turnstile_enabled;
}
