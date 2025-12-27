// =========================================
// TYPE DEFINITIONS ONLY
// Data asli sekarang diambil dari Supabase
// =========================================

export type CourseCategory = "Reguler" | "MBKM";

// Tipe Data untuk Mata Kuliah (sesuai tabel 'courses' di DB)
export interface CourseData {
  id: number;      
  kode: string;    
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
}

// Tipe Data Profil Mahasiswa (sesuai tabel 'students' di DB)
export interface StudentProfile {
  id: number;      
  nim: string;     
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

// Tipe Data Transkrip (Gabungan dari tabel 'grades' & 'courses')
export interface TranscriptItem {
  no: number;
  course_id?: number; // Opsional, untuk referensi ID course
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string; // Huruf Mutu (A, B, C, dst)
  am: number; // Angka Mutu (4, 3, 2, dst)
  nm: number; // Nilai Mutu (am * sks)
  kategori?: CourseCategory; 
}

// Tipe Data Utama yang digunakan di Dashboard & Halaman Mahasiswa
export interface StudentData {
  id: string; 
  profile: StudentProfile;
  transcript: TranscriptItem[];
}