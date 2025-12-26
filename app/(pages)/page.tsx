"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { students, coursesList, StudentData, TranscriptItem } from "../../lib/data"; //

/* ================= TYPES ================= */

type StatCardProps = {
  label: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  themeColor: "chart-1" | "chart-2" | "chart-3" | "chart-4";
};

/* ================= HELPER FUNCTIONS ================= */

function calculateIPK(transcript: TranscriptItem[]) {
  const totalSKS = transcript.reduce((acc, curr) => acc + curr.sks, 0); //
  const totalNM = transcript.reduce((acc, curr) => acc + curr.nm, 0); //
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

function calculateStudentIPS(transcript: TranscriptItem[], semester: number) {
  const semesterItems = transcript.filter((t) => t.smt === semester); //
  if (semesterItems.length === 0) return null;

  const totalSKS = semesterItems.reduce((acc, curr) => acc + curr.sks, 0); //
  const totalNM = semesterItems.reduce((acc, curr) => acc + curr.nm, 0); //
  
  if (totalSKS === 0) return 0;
  return totalNM / totalSKS;
}

function calculateSemesterTrend(allStudents: StudentData[]) {
  let maxSmt = 0;
  allStudents.forEach(s => {
    s.transcript.forEach(t => {
      if (t.smt > maxSmt) maxSmt = t.smt;
    });
  });

  const trendData = [];

  for (let smt = 1; smt <= maxSmt; smt++) {
    let totalIPS = 0;
    let countStudent = 0;

    allStudents.forEach((student) => {
      const ips = calculateStudentIPS(student.transcript, smt);
      if (ips !== null) {
        totalIPS += ips;
        countStudent++;
      }
    });

    const avgIPS = countStudent > 0 ? totalIPS / countStudent : 0;
    const heightPercentage = Math.min((avgIPS / 4) * 100, 100);

    trendData.push({
      label: `Smt ${smt}`,
      val: Number(avgIPS.toFixed(2)),
      height: `${heightPercentage}%`,
    });
  }

  return trendData;
}

function calculateGradeDistribution(allStudents: StudentData[]) {
  const counts = { A: 0, B: 0, C: 0, D: 0, E: 0 };
  let totalGrades = 0;
  let totalAM = 0;

  allStudents.forEach((student) => {
    student.transcript.forEach((item) => {
      const grade = item.hm as keyof typeof counts;
      if (counts[grade] !== undefined) {
        counts[grade]++;
        totalGrades++;
        totalAM += item.am;
      }
    });
  });

  return { counts, totalGrades, totalAM };
}

/* ================= PAGE ================= */

export default function DashboardPage() {
  
  const { statData, trendData, gradeDistData } = useMemo(() => {
    const studentCount = students.length; //
    const courseCount = coursesList.length; //

    let totalIPK = 0;
    students.forEach(s => {
      totalIPK += calculateIPK(s.transcript);
    });
    const avgIPK = studentCount > 0 ? (totalIPK / studentCount).toFixed(2) : "0.00";

    const dist = calculateGradeDistribution(students);
    const trend = calculateSemesterTrend(students);
    const avgGradePoint = dist.totalGrades > 0 ? (dist.totalAM / dist.totalGrades).toFixed(2) : "0.00";

    return {
      statData: [
        { 
          label: "Total Mahasiswa", 
          value: studentCount.toLocaleString(), 
          description: "Mahasiswa Aktif", 
          icon: <UsersIcon className="w-6 h-6" />, 
          themeColor: "chart-1" as const 
        },
        { 
          label: "Total Mata Kuliah", 
          value: courseCount.toString(), 
          description: "Kurikulum Berjalan", 
          icon: <LibraryIcon className="w-6 h-6" />, 
          themeColor: "chart-2" as const 
        },
        { 
          label: "Rata-rata Nilai", 
          value: avgGradePoint, 
          description: "Skala Indeks 4.00", 
          icon: <AwardIcon className="w-6 h-6" />, 
          themeColor: "chart-3" as const 
        },
        { 
          label: "Rata-rata IPK", 
          value: avgIPK, 
          description: "Performa Angkatan", 
          icon: <TrendingUpIcon className="w-6 h-6" />, 
          themeColor: "chart-4" as const 
        },
      ],
      trendData: trend,
      gradeDistData: dist,
    };
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard Akademik
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Ringkasan performa akademik berdasarkan data riil sistem.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:mt-6 md:mt-0">
          <Link
            href="/transkrip"
            className="inline-flex h-10 items-center gap-2 rounded-lg
                       bg-primary px-4 text-sm font-medium text-primary-foreground
                       hover:opacity-90 shadow-sm transition
                       focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <PrinterIcon className="h-4 w-4" />
            Cetak Transkrip
          </Link>
        </div>
      </div>

      {/* ===== STAT GRID ===== */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statData.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* ===== GRAFIK GRID ===== */}
      <div className="grid gap-6 lg:grid-cols-7">
        
        {/* GRAFIK 1: TREN PERFORMA (Bar Chart) */}
        <section className="lg:col-span-4 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
          <header className="px-6 py-5 border-b border-border bg-muted/40">
            <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-primary" />
              Tren Rata-rata IPS Mahasiswa
            </h3>
          </header>

          <div className="p-6 flex-1 flex items-end justify-center min-h-[300px]">
            <SemesterBarChart data={trendData} />
          </div>
        </section>

        {/* GRAFIK 2: DISTRIBUSI NILAI (Donut Chart) */}
        <section className="lg:col-span-3 rounded-xl border border-border bg-card text-card-foreground shadow-sm flex flex-col overflow-hidden">
          <header className="px-6 py-5 border-b border-border bg-muted/40">
            <h3 className="font-semibold tracking-tight text-foreground flex items-center gap-2">
              <ChartPieIcon className="w-4 h-4 text-primary" />
              Distribusi Nilai Mata Kuliah
            </h3>
          </header>

          <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <GradeDonutChart counts={gradeDistData.counts} total={gradeDistData.totalGrades} />
          </div>
        </section>
      </div>
    </div>
  );
}

/* ================= COMPONENTS ================= */

function StatCard({ label, value, description, icon, themeColor }: StatCardProps) {
  const colorMap = {
    "chart-1": "text-chart-1 border-chart-1/20 bg-chart-1/10",
    "chart-2": "text-chart-2 border-chart-2/20 bg-chart-2/10",
    "chart-3": "text-chart-3 border-chart-3/20 bg-chart-3/10",
    "chart-4": "text-chart-4 border-chart-4/20 bg-chart-4/10",
  };

  return (
    <div className="group relative rounded-xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex items-start justify-between">
        <div className="flex flex-col">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold tracking-tight text-foreground">
              {value}
            </span>
          </div>
          <p className="mt-1 text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
            {description}
          </p>
        </div>
        
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border ${colorMap[themeColor]} transition-transform group-hover:scale-105`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SemesterBarChart({ data }: { data: { label: string; val: number; height: string }[] }) {
  if (data.length === 0) {
    return <div className="text-sm text-muted-foreground">Belum ada data nilai.</div>;
  }

  return (
    <div className="w-full h-full flex items-end justify-between gap-2 sm:gap-4 px-2 pb-2">
      {data.map((item, idx) => (
        <div key={idx} className="group relative flex-1 flex flex-col items-center justify-end h-full">
          <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-2 group-hover:translate-y-0 bg-popover text-popover-foreground border border-border text-xs font-medium py-1.5 px-3 rounded-lg shadow-lg whitespace-nowrap z-10">
            IPS: <span className="text-primary font-bold">{item.val}</span>
          </div>
          
          <div 
            className="w-full max-w-[48px] bg-muted/50 rounded-t-xl relative overflow-hidden group-hover:shadow-lg transition-all"
            style={{ height: item.height }}
          >
            <div className="absolute bottom-0 left-0 right-0 bg-primary w-full h-full opacity-90 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="mt-4 text-[10px] sm:text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors text-center uppercase tracking-wider">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}

function GradeDonutChart({ counts, total }: { counts: { A: number; B: number; C: number; D: number; E: number }; total: number }) {
  if (total === 0) return <div className="text-sm text-muted-foreground">Belum ada data nilai.</div>;

  const pA = (counts.A / total) * 100;
  const pB = (counts.B / total) * 100;
  const pC = (counts.C / total) * 100;
  const pD = (counts.D / total) * 100;
  
  const stopA = pA;
  const stopB = stopA + pB;
  const stopC = stopB + pC;
  const stopD = stopC + pD;

  // KONFIGURASI WARNA FINAL:
  // A: Hijau (chart-2), B: Biru (primary), C: Kuning (chart-4), D/E: Merah (chart-5)
  const gradient = `conic-gradient(
    var(--color-chart-2) 0% ${stopA}%, 
    var(--primary) ${stopA}% ${stopB}%, 
    var(--color-chart-4) ${stopB}% ${stopC}%, 
    var(--color-chart-5) ${stopC}% ${stopD}%,
    var(--color-muted) ${stopD}% 100%
  )`;

  const legend = [
    { label: "A (Sangat Baik)", colorClass: "bg-chart-2", val: `${Math.round(pA)}%` },
    { label: "B (Baik)", colorClass: "bg-primary", val: `${Math.round(pB)}%` }, //
    { label: "C (Cukup)", colorClass: "bg-chart-4", val: `${Math.round(pC)}%` }, //
    { label: "D/E (Kurang)", colorClass: "bg-chart-5", val: `${Math.round(100 - stopC)}%` }, //
  ];

  return (
    <div className="flex flex-col items-center w-full">
      <div className="relative w-52 h-52 rounded-full shadow-lg border-4 border-card" style={{ background: gradient }}>
        <div className="absolute inset-4 bg-card rounded-full flex items-center justify-center flex-col shadow-inner">
          <span className="text-4xl font-extrabold text-card-foreground tracking-tight">{total}</span>
          <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest mt-1">Total Nilai</span>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-4 w-full px-4">
        {legend.map((l, i) => (
          <div key={i} className="flex items-center justify-between text-sm group cursor-default">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${l.colorClass} ring-2 ring-card shadow-sm group-hover:scale-125 transition-transform`} />
              <span className="text-muted-foreground font-medium text-xs sm:text-sm group-hover:text-foreground transition-colors">{l.label}</span>
            </div>
            <span className="font-bold text-foreground text-xs sm:text-sm">{l.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ================= ICONS ================= */

function PrinterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}

function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LibraryIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="m16 6 4 14" />
      <path d="M12 6v14" />
      <path d="M8 8v12" />
      <path d="M4 4v16" />
    </svg>
  );
}

function AwardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="7" />
      <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
    </svg>
  );
}

function TrendingUpIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}

function ChartPieIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
      <path d="M22 12A10 10 0 0 0 12 2v10z" />
    </svg>
  );
}