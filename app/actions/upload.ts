"use server";

import { createClient } from "@supabase/supabase-js";

// Inisialisasi Client Admin menggunakan Service Role Key dari ENV
// Ini AMAN karena berjalan di sisi server ("use server")
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function uploadAvatar(formData: FormData, oldUrl?: string | null) {
  const file = formData.get("file") as File;
  const username = formData.get("username") as string;

  if (!file || !username) {
    throw new Error("File dan Username diperlukan.");
  }

  // Validasi tipe file di sisi server
  const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
  if (!validTypes.includes(file.type)) {
    throw new Error("Format file harus JPG, PNG, atau WEBP.");
  }

  // Validasi ukuran (contoh 2MB)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error("Ukuran file maksimal 2MB.");
  }

  try {
    // 1. Buat nama file unik
    const fileExt = file.name.split(".").pop();
    const fileName = `${username}-${Date.now()}.${fileExt}`;
    // Simpan di dalam folder avatars (pastikan bucket 'avatars' sudah dibuat di Supabase)
    const filePath = `${fileName}`;

    // 2. Hapus file lama jika ada (opsional, agar hemat storage)
    if (oldUrl) {
      const oldFileName = oldUrl.split("/").pop();
      if (oldFileName) {
        await supabaseAdmin.storage.from("avatars").remove([oldFileName]);
      }
    }

    // 3. Upload file baru
    const { error: uploadError } = await supabaseAdmin.storage
      .from("avatars")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) throw uploadError;

    // 4. Dapatkan URL Publik
    const { data } = supabaseAdmin.storage
      .from("avatars")
      .getPublicUrl(filePath);

    return data.publicUrl;

  } catch (error: any) {
    console.error("Upload Error:", error);
    throw new Error("Gagal mengunggah gambar: " + error.message);
  }
}