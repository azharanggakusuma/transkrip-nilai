import studentsDB from "./students.json";
import gradesDB from "./grades.json";
import coursesDB from "./courses.json"; // Import data baru

// =========================================
// 1. TYPE DEFINITIONS
// =========================================

export type CourseCategory = "Reguler" | "MBKM";

// Struktur data untuk mata kuliah (dari courses.json)
export interface CourseData {
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
}

// Struktur data mentah nilai (dari grades.json)
export interface RawGrade {
  kode: string;
  hm: string;
  smt?: number; // Opsional jika ingin override semester default
}

// Struktur data mentah profil (dari students.json)
export interface RawStudentProfile {
  nim: string;
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

// Hasil akhir data mahasiswa yang sudah diproses
export interface StudentProfile extends RawStudentProfile {
  // Anda bisa override tipe spesifik jika perlu, 
  // tapi extend RawStudentProfile sudah cukup untuk sekarang.
}

export interface TranscriptItem {
  no: number;
  kode: string;
  matkul: string;
  smt: number;
  sks: number;
  hm: string;
  am: number;
  nm: number;
  kategori: CourseCategory;
}

export interface StudentData {
  id: string; 
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// =========================================
// 2. CONSTANTS & MAPPINGS
// =========================================

// Cast coursesDB agar TypeScript mengenali strukturnya sebagai Record
const COURSES_MASTER: Record<string, CourseData> = coursesDB as Record<string, CourseData>;

const GRADE_POINTS: Record<string, number> = {
  "A": 4, "B": 3, "C": 2, "D": 1, "E": 0
};

const PRODI_FULL_NAMES: Record<string, string> = {
  "TI": "Teknik Informatika",
  "SI": "Sistem Informasi",
  "MI": "Manajemen Informatika",
  "KA": "Komputerisasi Akuntansi",
  "RPL": "Rekayasa Perangkat Lunak"
};

// =========================================
// 3. HELPER FUNCTIONS
// =========================================

function getAm(hm: string): number {
  return GRADE_POINTS[hm] ?? 0;
}

function createStudent(
  rawProfile: RawStudentProfile,
  rawGrades: RawGrade[]
): StudentData {
  
  // Normalisasi Prodi
  const fullProdi = PRODI_FULL_NAMES[rawProfile.prodi] || rawProfile.prodi;

  // Buat Profile
  const profile: StudentProfile = {
    ...rawProfile,
    prodi: fullProdi
  };

  // Proses Transkrip
  const transcript: TranscriptItem[] = rawGrades.map((g, index) => {
    const course = COURSES_MASTER[g.kode];

    // Fallback jika kode matkul tidak ditemukan di database
    if (!course) {
      console.warn(`Warning: Course code '${g.kode}' not found for student ${rawProfile.nim}`);
      return {
        no: index + 1,
        kode: g.kode,
        matkul: "UNKNOWN COURSE",
        smt: g.smt || 0,
        sks: 0,
        hm: g.hm,
        am: 0,
        nm: 0,
        kategori: "Reguler"
      };
    }

    const am = getAm(g.hm);
    
    return {
      no: index + 1,
      kode: g.kode,
      matkul: course.matkul,
      smt: g.smt || course.smt_default, // Gunakan semester dari grades.json jika ada, jika tidak pakai default
      sks: course.sks,
      hm: g.hm,
      am: am,
      nm: am * course.sks,
      kategori: course.kategori
    };
  });

  return { 
    id: profile.nim,
    profile, 
    transcript 
  };
}

// =========================================
// 4. MAIN EXPORT
// =========================================

// Casting gradesDB karena JSON keys bersifat dinamis (NIM)
const allGrades = gradesDB as Record<string, RawGrade[]>;

export const students: StudentData[] = studentsDB.map((student) => {
  const grades = allGrades[student.nim] || [];
  return createStudent(student, grades);
});