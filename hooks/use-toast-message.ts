// hooks/use-toast-message.ts
import { toast } from "sonner";

export function useToastMessage() {
  
  // 1. Loading
  const showLoading = (message: string = "Sedang memproses...") => {
    return toast.loading(message);
  };

  // 2. Success Manual
  const showSuccess = (title: string, description?: string, id?: string | number) => {
    toast.success(title, { description, id });
  };

  // 3. Error Manual
  const showError = (title: string, description?: string, id?: string | number) => {
    toast.error(title, {
      description: description || "Terjadi kesalahan sistem. Silakan coba lagi.",
      id,
    });
  };

  /**
   * 4. TEMPLATE SUKSES STANDAR
   * Digunakan agar pesan sukses seragam di seluruh aplikasi.
   * @param entity Nama data (Contoh: "Menu", "User", "Mahasiswa")
   * @param action Jenis aksi ("create", "update", "delete")
   * @param id ID toast (jika ingin me-replace loading)
   */
  const successAction = (
    entity: string, 
    action: "create" | "update" | "delete", 
    id?: string | number
  ) => {
     const templates = {
        create: {
            title: "Berhasil Ditambahkan",
            desc: `Data ${entity} baru telah berhasil ditambahkan.`
        },
        update: {
            title: "Perubahan Disimpan",
            desc: `Data ${entity} berhasil diperbarui.`
        },
        delete: {
            title: "Berhasil Dihapus",
            desc: `Data ${entity} telah dihapus dari sistem.`
        }
     };

     const t = templates[action];
     showSuccess(t.title, t.desc, id);
  };
  
  /**
   * 5. TEMPLATE ERROR STANDAR
   * Menangani logging error ke console dan menampilkan pesan user-friendly.
   */
  const errorAction = (
    action: "save" | "delete" | "load", 
    errorRaw?: any, 
    id?: string | number
  ) => {
     // Log error asli untuk Developer
     if (errorRaw) console.error(`[${action.toUpperCase()} ERROR]`, errorRaw);
     
     const templates = {
        save: {
            title: "Gagal Menyimpan",
            desc: "Terjadi kendala saat menyimpan data. Silakan coba lagi beberapa saat lagi."
        },
        delete: {
            title: "Gagal Menghapus",
            desc: "Data tidak dapat dihapus. Kemungkinan data sedang digunakan oleh fitur lain."
        },
        load: {
            title: "Gagal Memuat Data",
            desc: "Terjadi kesalahan saat mengambil data. Silakan muat ulang halaman."
        }
     };

     const t = templates[action];
     showError(t.title, t.desc, id);
  };

  return { 
    showLoading, 
    showSuccess, 
    showError, 
    successAction, 
    errorAction,
    dismiss: toast.dismiss // Expose fungsi dismiss asli jika butuh
  };
}