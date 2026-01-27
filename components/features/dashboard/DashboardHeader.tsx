import Link from "next/link";
import { PrinterIcon } from "./DashboardIcons";

interface DashboardHeaderProps {
  name?: string;
  role?: string;
}

export function DashboardHeader({ name = "User", role = "mahasiswa" }: DashboardHeaderProps) {
  const isMahasiswa = role === "mahasiswa";
  
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          Halo, {name}!
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {isMahasiswa 
            ? "Selamat datang kembali. Berikut progres studi Anda terkini."
            : "Selamat datang kembali. Berikut statistik data akademik terkini."
          }
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
  );
}