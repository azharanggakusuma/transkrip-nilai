"use server";

import { createClient } from "@/lib/supabase/server";

export async function checkSystemHealth() {
  const supabase = await createClient();
  const start = Date.now();

  try {
    // Parallel checks
    const [dbResult, storageResult] = await Promise.all([
      supabase.from("academic_years").select("count", { count: "exact", head: true }),
      supabase.storage.listBuckets()
    ]);

    const latency = Date.now() - start;
    const dbHealthy = !dbResult.error;
    const storageHealthy = !storageResult.error;

    let status = "healthy";
    let message = "Semua sistem berjalan dengan normal";

    if (!dbHealthy && !storageHealthy) {
      status = "error";
      message = "Gangguan total layanan sistem";
    } else if (!dbHealthy || !storageHealthy) {
      status = "warning";
      message = !dbHealthy ? "Kendala pada database terdeteksi" : "Kendala pada storage terdeteksi";
    }

    return {
      status,
      latency,
      message,
      timestamp: new Date().toISOString(),
      checks: {
        database: dbHealthy,
        storage: storageHealthy
      }
    };
  } catch (err: any) {
    return {
      status: "error",
      latency: Date.now() - start,
      message: err.message || "Unknown error",
      timestamp: new Date().toISOString(),
      checks: {
        database: false,
        storage: false
      }
    };
  }
}
