"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function getSignatureBase64(pathOrType: string) {
  try {
    // 1. Inisialisasi Supabase Admin
    const supabase = createAdminClient();

    // 2. Tentukan nama file
    // If input contains "ttd-", assume it is a path/filename. Otherwise map legacy types.
    let filename = pathOrType;

    if (pathOrType === "digital") filename = "ttd-digital.png";

    else if (pathOrType === "basah") filename = "ttd-basah.png";
    else {
      // Handle if full URL is passed. Assuming bucket is 'signatures'.
      // Example: .../storage/v1/object/public/signatures/folder/file.png
      // We need 'folder/file.png' or just 'file.png' depending on how it's stored.
      // Simple heuristic: take everything after the last slash if it looks like a url
      if (filename.startsWith("http")) {
        try {
          const url = new URL(filename);
          const pathParts = url.pathname.split('/');
          // Find 'signatures' in path and take the rest?
          // Or usually just the last part?
          // Safeguard: take the last segment for now, or match common supabase pattern
          const lastSegment = pathParts[pathParts.length - 1];
          filename = lastSegment;
        } catch (e) {
          // Fallback, keep as is
        }
      }
    }

    // Clean up if full URL is passed? Usually storage download expects just filename inside bucket.
    // Assuming official.ttd_digital_url stores just the filename or partial path. 
    // If it stores full URL, we need to extract filename.
    // For now, assuming it stores filename or relative path.

    const bucketName = "signatures";

    // 3. Download file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filename);

    if (error) {
      console.error(`Error downloading ${filename}:`, error.message);
      return null;
    }

    if (!data) return null;

    // 4. Konversi Blob ke Base64
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:image/png;base64,${buffer.toString("base64")}`;

    return base64String;

  } catch (error) {
    console.error("Gagal memuat tanda tangan dari Supabase:", error);
    return null;
  }
}