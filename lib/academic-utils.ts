
export function calculateStudentSemester(
  angkatan: number | string | null | undefined,
  activeYear: { nama: string; semester: string } | null
): number {
  if (!angkatan || !activeYear) return 1;

  const angkatanNum = typeof angkatan === "string" ? parseInt(angkatan) : angkatan;
  const currentStartYear = parseInt(activeYear.nama.split('/')[0]);

  if (isNaN(currentStartYear) || isNaN(angkatanNum)) return 1;

  const yearDiff = currentStartYear - angkatanNum;
  let sem = yearDiff * 2;

  if (activeYear.semester === 'Ganjil') {
    sem += 1;
  } else if (activeYear.semester === 'Genap') {
    sem += 2;
  }

  return sem > 0 ? sem : 1;
}
