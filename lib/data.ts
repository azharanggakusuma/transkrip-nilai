import studentsDB from "./students.json";
import gradesDB from "./grades.json";
import coursesDB from "./courses.json"; // Pastikan file ini sudah Anda buat sebelumnya

// =========================================
// 1. TYPE DEFINITIONS
// =========================================

export type CourseCategory = "Reguler" | "MBKM";

export interface CourseData {
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
}

export interface RawGrade {
  kode: string;
  hm: string;
  smt?: number;
}

// Interface untuk data mentah di students.json
export interface RawStudentProfile {
  id: number;      // ID Unik (Auto Increment)
  nim: string;     // Kunci Relasi ke Grades
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

export interface StudentProfile extends RawStudentProfile {
  // Extend jika perlu properti tambahan di masa depan
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
  id: string; // ID dikonversi ke string untuk konsistensi URL/State
  profile: StudentProfile;
  transcript: TranscriptItem[];
}

// =========================================
// 2. CONSTANTS & MAPPINGS
// =========================================

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

function createStudentData(rawStudent: RawStudentProfile): StudentData {
  // Normalisasi Prodi
  const fullProdi = PRODI_FULL_NAMES[rawStudent.prodi] || rawStudent.prodi;

  const profile: StudentProfile = {
    ...rawStudent,
    prodi: fullProdi
  };

  // AMBIL NILAI BERDASARKAN NIM (Relasi: ID -> NIM -> Grades)
  const allGrades = gradesDB as Record<string, RawGrade[]>;
  const rawGrades = allGrades[rawStudent.nim] || [];

  const transcript: TranscriptItem[] = rawGrades.map((g, index) => {
    const course = COURSES_MASTER[g.kode];

    if (!course) {
      return {
        no: index + 1, kode: g.kode, matkul: "UNKNOWN", smt: g.smt || 0,
        sks: 0, hm: g.hm, am: 0, nm: 0, kategori: "Reguler"
      };
    }

    const am = getAm(g.hm);
    return {
      no: index + 1,
      kode: g.kode,
      matkul: course.matkul,
      smt: g.smt || course.smt_default,
      sks: course.sks,
      hm: g.hm,
      am: am,
      nm: am * course.sks,
      kategori: course.kategori
    };
  });

  return { 
    id: rawStudent.id.toString(), // Convert ID number ke string
    profile, 
    transcript 
  };
}

// =========================================
// 4. MAIN EXPORTS
// =========================================

export function getStudentById(id: string | number): StudentData | null {
  const targetId = Number(id);
  const rawStudent = studentsDB.find((s) => s.id === targetId);
  if (!rawStudent) return null;
  return createStudentData(rawStudent);
}

// Export default list mahasiswa
export const students: StudentData[] = studentsDB.map((s) => createStudentData(s));