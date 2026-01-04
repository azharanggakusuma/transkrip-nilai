import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, XCircle, FileText } from "lucide-react";

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <span className="text-slate-400">-</span>;

  let styles = "bg-slate-100 text-slate-600 border-slate-200";
  let icon = <FileText className="mr-1.5 h-3 w-3" />;
  let label = "Belum Diajukan";

  switch (status) {
    case "APPROVED":
      styles = "bg-green-600 text-white border-transparent";
      icon = <CheckCircle2 className="mr-1.5 h-3 w-3" />;
      label = "Disetujui";
      break;
    case "SUBMITTED":
      styles = "bg-blue-600 text-white border-transparent";
      icon = <Clock className="mr-1.5 h-3 w-3" />;
      label = "Diajukan";
      break;
    case "REJECTED":
      styles = "bg-red-600 text-white border-transparent";
      icon = <XCircle className="mr-1.5 h-3 w-3" />;
      label = "Ditolak";
      break;
  }

  return (
    <Badge variant="outline" className={`font-medium px-2.5 py-0.5 ${styles}`}>
      {icon} {label}
    </Badge>
  );
}