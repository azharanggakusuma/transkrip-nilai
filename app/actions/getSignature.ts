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
      // 3. Handle URL Parsing (untuk extract path relative terhadap bucket)
      if (filename.startsWith("http")) {
        try {
          const url = new URL(filename);
          // Pola URL Supabase Storage: .../storage/v1/object/public/signatures/FOLDER/FILE.png
          // Kita butuh "FOLDER/FILE.png" (path setelah bucket "signatures")
          const splitKey = `/signatures/`;
          if (url.pathname.includes(splitKey)) {
            filename = url.pathname.split(splitKey)[1]; // Ambil bagian setelah bucket
          } else {
            // Fallback: ambil segmen terakhir (mungkin tidak ada folder)
            const pathParts = url.pathname.split('/');
            filename = pathParts[pathParts.length - 1];
          }

          // Decode URI component (misal spasi jadi %20)
          filename = decodeURIComponent(filename);
        } catch (e) {
          // Fallback jika URL invalid
        }
      }
    }

    const bucketName = "signatures";

    // 4. Download file
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filename);

    if (error) {
      // Jangan throw/error keras jika file default tidak ada (misal ttd-basah.png belum diupload)
      if (filename === "ttd-basah.png" || filename === "ttd-digital.png") {
        console.warn(`Default signature '${filename}' not found in bucket.`);
        return null;
      }
      console.error(`Error downloading ${filename}:`, error.message);
      return null;
    }

    if (!data) return null;

    // 5. Konversi Blob ke Base64
    const arrayBuffer = await data.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = `data:image/png;base64,${buffer.toString("base64")}`;

    return base64String;

  } catch (error) {
    console.error("Gagal memuat tanda tangan dari Supabase:", error);
    return null;
  }
}