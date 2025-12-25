"use client";

import React, { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { 
  MoreHorizontal, 
  Pencil, 
  Trash2, 
  Plus, 
  Search, 
  Filter
} from "lucide-react";

// --- SHADCN COMPONENTS ---
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- TYPES ---
type CourseCategory = "Reguler" | "MBKM";

interface CourseData {
  kode: string;
  matkul: string;
  sks: number;
  smt_default: number;
  kategori: CourseCategory;
}

// --- DATA ---
const INITIAL_DATA: CourseData[] = [
  { kode: "MKWI-21012", matkul: "Bahasa Inggris Dasar", sks: 2, smt_default: 1, kategori: "Reguler" },
  { kode: "MKWI-21014", matkul: "Kalkulus", sks: 3, smt_default: 1, kategori: "Reguler" },
  { kode: "MKWI-21001", matkul: "Algoritma dan Pemrograman Dasar", sks: 3, smt_default: 1, kategori: "Reguler" },
  { kode: "SIW-2121", matkul: "Jaringan Komputer", sks: 3, smt_default: 2, kategori: "Reguler" },
  { kode: "MDK-0306", matkul: "Data Science", sks: 3, smt_default: 3, kategori: "Reguler" },
  { kode: "MBKM-TI-04073", matkul: "Technopreneurship", sks: 3, smt_default: 4, kategori: "MBKM" },
];

export default function MataKuliahPage() {
  const [courses, setCourses] = useState<CourseData[]>(INITIAL_DATA);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState<CourseData>({
    kode: "",
    matkul: "",
    sks: 2,
    smt_default: 1,
    kategori: "Reguler",
  });

  // Filter Logic
  const filteredCourses = courses.filter((course) =>
    course.matkul.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.kode.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handlers
  const handleOpenAdd = () => {
    setFormData({ kode: "", matkul: "", sks: 2, smt_default: 1, kategori: "Reguler" });
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (course: CourseData) => {
    setFormData(course);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (kode: string) => {
    if (confirm(`Hapus data ${kode}?`)) {
      setCourses((prev) => prev.filter((item) => item.kode !== kode));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      setCourses((prev) =>
        prev.map((item) => (item.kode === formData.kode ? formData : item))
      );
    } else {
      if (courses.some((c) => c.kode === formData.kode)) {
        alert("Kode sudah ada!");
        return;
      }
      setCourses((prev) => [...prev, formData]);
    }
    setIsDialogOpen(false);
  };

  return (
    // PERUBAHAN 1: gap-8 diubah jadi gap-4 agar lebih rapat
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-500">
      <PageHeader 
        title="Mata Kuliah" 
        breadcrumb={["SIAKAD", "Mata Kuliah"]} 
      />

      <Card className="border-none shadow-sm ring-1 ring-gray-200">
        <CardContent className="p-6">
          {/* PERUBAHAN 2: mb-6 diubah jadi mb-4 agar jarak toolbar ke tabel lebih dekat */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-72">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Cari kode atau nama..."
                    className="pl-9 bg-muted/30"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button variant="outline" size="icon" className="text-muted-foreground shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
            </div>

            <Button onClick={handleOpenAdd} className="bg-primary hover:bg-primary/90 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Tambah Data
            </Button>
          </div>

          {/* Table Modern */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[50px] text-center">#</TableHead>
                  <TableHead>Kode MK</TableHead>
                  <TableHead>Mata Kuliah</TableHead>
                  <TableHead className="text-center w-[100px]">SKS</TableHead>
                  <TableHead className="text-center w-[100px]">Semester</TableHead>
                  <TableHead className="w-[150px]">Kategori</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCourses.length > 0 ? (
                  filteredCourses.map((row, index) => (
                    <TableRow key={row.kode} className="group hover:bg-muted/30 transition-colors">
                      <TableCell className="text-center font-medium text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-medium text-foreground">
                        {row.kode}
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-gray-700">{row.matkul}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-xs font-semibold text-gray-700">
                          {row.sks}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-muted-foreground">
                        {row.smt_default}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={row.kategori === "MBKM" ? "secondary" : "outline"}
                          className={`font-normal ${
                            row.kategori === "MBKM" 
                              ? "bg-purple-100 text-purple-700 hover:bg-purple-100 border-none" 
                              : "border-gray-300 text-gray-600"
                          }`}
                        >
                          {row.kategori}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity data-[state=open]:opacity-100">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleOpenEdit(row)}>
                              <Pencil className="mr-2 h-4 w-4 text-muted-foreground" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-red-600 focus:text-red-600 focus:bg-red-50"
                              onClick={() => handleDelete(row.kode)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Hapus
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                      Data tidak ditemukan.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* PERUBAHAN 3: Update format teks footer */}
          <div className="mt-4 text-xs text-muted-foreground">
            Menampilkan <strong>{filteredCourses.length}</strong> dari <strong>{courses.length}</strong> data
          </div>
        </CardContent>
      </Card>

      {/* --- MODAL DIALOG --- */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? "Edit Mata Kuliah" : "Tambah Mata Kuliah"}</DialogTitle>
            <DialogDescription>
              Pastikan kode mata kuliah unik dan sesuai dengan kurikulum yang berlaku.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="kode">Kode MK</Label>
              <Input
                id="kode"
                value={formData.kode}
                onChange={(e) => setFormData({ ...formData, kode: e.target.value })}
                disabled={isEditing}
                placeholder="Contoh: TKK-0605"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="matkul">Nama Mata Kuliah</Label>
              <Input
                id="matkul"
                value={formData.matkul}
                onChange={(e) => setFormData({ ...formData, matkul: e.target.value })}
                placeholder="Contoh: Artificial Intelligence"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sks">SKS</Label>
                <Input
                  id="sks"
                  type="number"
                  min={1} 
                  max={6}
                  value={formData.sks}
                  onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smt">Semester</Label>
                <Input
                  id="smt"
                  type="number"
                  min={1} 
                  max={8}
                  value={formData.smt_default}
                  onChange={(e) => setFormData({ ...formData, smt_default: parseInt(e.target.value) || 0 })}
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="kategori">Kategori</Label>
              <Select
                value={formData.kategori}
                onValueChange={(val: CourseCategory) => setFormData({ ...formData, kategori: val })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Reguler">Reguler</SelectItem>
                  <SelectItem value="MBKM">MBKM</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <DialogFooter className="mt-4">
              <Button type="submit">Simpan Data</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}