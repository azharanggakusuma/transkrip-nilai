"use client";

import React, { useState, useMemo } from "react";
import { DataTable, type Column } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Pencil, Trash2, CheckCircle2, XCircle, HelpCircle, CornerDownRight } from "lucide-react";
import { Menu } from "@/lib/types";
import * as LucideIcons from "lucide-react";

interface MenuTableProps {
  data: Menu[];
  isLoading: boolean;
  onEdit: (menu: Menu) => void;
  onDelete: (menu: Menu) => void;
  onAdd: () => void;
}

const RowIcon = ({ name }: { name: string }) => {
  // @ts-ignore 
  const IconComponent = LucideIcons[name];
  if (!IconComponent) return <HelpCircle className="h-4 w-4 text-slate-400" />;
  return <IconComponent className="h-4 w-4 text-slate-700" />;
};

export default function MenuTable({ data, isLoading, onEdit, onDelete, onAdd }: MenuTableProps) {
  
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter Data
  const filteredData = useMemo(() => {
    let result = data;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.label.toLowerCase().includes(lowerQuery) ||
          item.href.toLowerCase().includes(lowerQuery) ||
          (item.parent && item.parent.label.toLowerCase().includes(lowerQuery)) // Search parent name
      );
    }
    return result;
  }, [data, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredData.slice(startIndex, endIndex);

  const columns: Column<Menu>[] = [
    {
      header: "#",
      className: "w-[50px] text-center",
      render: (_, index) => <span className="text-muted-foreground">{startIndex + index + 1}</span>,
    },
    {
      header: "Label Menu",
      render: (row) => (
        <div className="flex flex-col">
            {/* Tampilan Visual Parent vs Child */}
            {row.parent ? (
                 <div className="flex items-center gap-1.5 text-slate-600">
                    <CornerDownRight className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold">{row.label}</span>
                 </div>
            ) : (
                <span className="font-semibold text-slate-800">{row.label}</span>
            )}
            
            <div className="flex gap-2 text-xs text-muted-foreground mt-0.5">
               <span>{row.section}</span>
               {row.parent && (
                  <span className="bg-slate-100 px-1 rounded text-[10px] border">
                    Induk: {row.parent.label}
                  </span>
               )}
            </div>
        </div>
      ),
    },
    {
      header: "Icon & Path",
      render: (row) => (
        <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-md bg-slate-100 border border-slate-200 shrink-0">
                <RowIcon name={row.icon} />
            </div>
            <div className="flex flex-col gap-0.5">
                <code className="text-xs font-mono text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 w-fit">
                    {row.href}
                </code>
            </div>
        </div>
      ),
    },
    {
        header: "Urutan",
        className: "text-center w-[60px]",
        render: (row) => <span className="font-mono text-slate-600">{row.sequence}</span>,
    },
    {
        header: "Status",
        className: "text-center w-[90px]",
        render: (row) => (
          row.is_active ? 
          <Badge variant="default" className="bg-green-600/10 text-green-700 shadow-none"><CheckCircle2 className="w-3 h-3 mr-1"/> Aktif</Badge> : 
          <Badge variant="destructive" className="bg-red-50 text-red-700 shadow-none"><XCircle className="w-3 h-3 mr-1"/> Non</Badge>
        )
    },
    {
      header: "Aksi",
      className: "text-center w-[100px]",
      render: (row) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="text-amber-600 hover:bg-amber-50 h-8 w-8" onClick={() => onEdit(row)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="text-rose-600 hover:bg-rose-50 h-8 w-8" onClick={() => onDelete(row)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-none shadow-sm ring-1 ring-gray-200">
      <CardContent className="p-6">
        <DataTable
          data={currentData}
          columns={columns}
          isLoading={isLoading}
          searchQuery={searchQuery}
          onSearchChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          searchPlaceholder="Cari Menu..."
          onAdd={onAdd}
          addLabel="Tambah Menu"
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
          totalItems={filteredData.length}
        />
      </CardContent>
    </Card>
  );
}