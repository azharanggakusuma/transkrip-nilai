import studentsDB from "./students.json";
import gradesDB from "./grades.json";
import coursesDB from "./courses.json";

// =========================================
// 1. TYPE DEFINITIONS
// =========================================

export type CourseCategory = "Reguler" | "MBKM";

// Data Mata Kuliah
export interface CourseData {
  id: number;      
  kode: string;    
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
}

// Data Nilai Mentah (Grades JSON)
export interface RawGrade {
  course_id: number; // Relasi menggunakan ID Course
  hm: string;
  smt?: number;
}

// Data Mahasiswa Mentah (Students JSON)
export interface RawStudentProfile {
  id: number;      
  nim: string;     
  nama: string;
  alamat: string;
  prodi: string;
  jenjang: string;
  semester: number;
}

export interface StudentProfile extends RawStudentProfile {}

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

// --- PENTING: Lookup Course by ID ---
// Key-nya sekarang number (ID Course), bukan kode lagi.
const COURSES_LOOKUP = (coursesDB as CourseData[]).reduce((acc, course) => {
  acc[course.id] = course;
  return acc;
}, {} as Record<number, CourseData>);

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
  const fullProdi = PRODI_FULL_NAMES[rawStudent.prodi] || rawStudent.prodi;

  const profile: StudentProfile = {
    ...rawStudent,
    prodi: fullProdi
  };

  // --- LOGIC RELASI BARU ---
  // 1. Ambil nilai berdasarkan Student ID (bukan NIM)
  // Konversi studentsDB ID ke string karena JSON keys biasanya string, 
  // atau casting gradesDB agar menerima number key.
  const allGrades = gradesDB as unknown as Record<string, RawGrade[]>;
  const rawGrades = allGrades[rawStudent.id.toString()] || [];

  const transcript: TranscriptItem[] = rawGrades.map((g, index) => {
    // 2. Cari detail Course berdasarkan Course ID
    const course = COURSES_LOOKUP[g.course_id];

    if (!course) {
      // Fallback jika course_id di grades.json tidak ada di courses.json
      return {
        no: index + 1, kode: "UNKNOWN", matkul: "UNKNOWN COURSE", smt: g.smt || 0,
        sks: 0, hm: g.hm, am: 0, nm: 0, kategori: "Reguler"
      };
    }

    const am = getAm(g.hm);
    return {
      no: index + 1,
      kode: course.kode,      // Ambil kode terbaru dari database courses
      matkul: course.matkul,  // Ambil nama matkul terbaru
      smt: g.smt || course.smt_default,
      sks: course.sks,
      hm: g.hm,
      am: am,
      nm: am * course.sks,
      kategori: course.kategori
    };
  });

  return { 
    id: rawStudent.id.toString(),
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

export const students: StudentData[] = studentsDB.map((s) => createStudentData(s));

export const coursesList: CourseData[] = coursesDB as CourseData[];