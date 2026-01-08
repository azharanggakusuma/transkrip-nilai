"use client";

import React, { useState, useRef, useCallback } from "react";
import { User, Lock, Save, Info, Camera, Loader2, X, Check } from "lucide-react"; 
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Library
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage"; 
import imageCompression from "browser-image-compression"; // <--- IMPORT BARU

import { updateUserSettings } from "@/app/actions/auth";
import { uploadAvatar } from "@/app/actions/upload"; 
import { type UserProfile } from "@/lib/types";
import Image from "next/image"; 

interface ProfileFormProps {
  user: UserProfile | null;
  onUpdateSuccess: (newData: Partial<UserProfile>) => void;
}

export default function ProfileForm({ user, onUpdateSuccess }: ProfileFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // Indikator proses kompresi
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    nama: user?.name || "",
    username: user?.username || "", 
    alamat: user?.alamat || "",
    avatar_url: user?.avatar_url || "",
  });

  const [previewImage, setPreviewImage] = useState<string | null>(user?.avatar_url || null);
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  // --- STATE CROPPING ---
  const [imageSrc, setImageSrc] = useState<string | null>(null); 
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  if (!user) return null; 

  // --- FUNGSI KOMPRESI GAMBAR ---
  const compressImage = async (file: File): Promise<File> => {
    const options = {
      maxSizeMB: 0.5,           // Target ukuran maksimal 0.5 MB (500KB)
      maxWidthOrHeight: 1024,   // Resize resolusi max 1024px (Cukup tajam untuk foto profil)
      useWebWorker: true,       // Gunakan thread terpisah agar UI tidak lag
      fileType: "image/jpeg",   // Paksa jadi JPEG agar kompresi maksimal
      initialQuality: 0.9,      // Kualitas 90% (Sangat jernih)
    };

    try {
      setIsCompressing(true);
      const compressedFile = await imageCompression(file, options);
      
      // Kembalikan sebagai File object dengan nama asli
      return new File([compressedFile], file.name, { type: compressedFile.type });
    } catch (error) {
      console.error("Gagal kompresi:", error);
      toast.error("Gagal mengoptimalkan gambar.");
      return file; // Jika gagal, kembalikan file asli
    } finally {
      setIsCompressing(false);
    }
  };

  // 1. Saat user memilih file
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Kita batasi input awal agar browser tidak crash jika user upload file 100MB+
      if (file.size > 20 * 1024 * 1024) { 
         toast.error("File terlalu besar", { description: "Maksimal file 20MB." });
         return;
      }

      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropModalOpen(true); 
        setZoom(1); 
        setCrop({ x: 0, y: 0 }); 
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // 2. Saat User Klik "Gunakan Foto" (Crop + Kompresi terjadi di sini)
  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;

      // a. Crop Gambar
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Gagal memotong gambar.");

      // b. Ubah Blob hasil crop jadi File
      const croppedFile = new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" });

      // c. Lakukan Kompresi
      const optimizedFile = await compressImage(croppedFile);

      // d. Simpan file yang SUDAH OPTIMAL ke state upload
      setFileToUpload(optimizedFile);

      // e. Update Preview
      const objectUrl = URL.createObjectURL(optimizedFile);
      setPreviewImage(objectUrl);

      setIsCropModalOpen(false);
      setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 

      toast.success("Foto diproses", { 
        description: `Ukuran: ${(optimizedFile.size / 1024).toFixed(0)} KB (Siap disimpan)` 
      });

    } catch (e) {
      console.error(e);
      toast.error("Gagal memproses gambar.");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let finalAvatarUrl = formData.avatar_url;

      if (fileToUpload) {
        const uploadFormData = new FormData();
        uploadFormData.append("file", fileToUpload);
        uploadFormData.append("username", user.username); 

        // Upload file kecil (hasil kompresi) ke server
        finalAvatarUrl = await uploadAvatar(uploadFormData, user.avatar_url);
      }

      await updateUserSettings(user.username, {
        nama: formData.nama,
        username: formData.username,
        alamat: formData.alamat,
        role: user.role,
        avatar_url: finalAvatarUrl, 
      });

      toast.success("Berhasil", { description: "Profil diperbarui." });

      onUpdateSuccess({ 
        name: formData.nama, 
        username: formData.username, 
        alamat: formData.alamat,
        avatar_url: finalAvatarUrl
      });
      
      setFileToUpload(null);

    } catch (error: any) {
      toast.error("Gagal menyimpan", { description: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* --- MODAL CROPPER --- */}
      <Dialog open={isCropModalOpen} onOpenChange={(open) => !isCompressing && setIsCropModalOpen(open)}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Sesuaikan Foto</DialogTitle>
            <DialogDescription>
              Geser dan zoom untuk menyesuaikan foto profil Anda.
            </DialogDescription>
          </DialogHeader>
          
          <div className="relative w-full h-[300px] bg-slate-900 rounded-md overflow-hidden mt-2">
            {imageSrc && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1} 
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            )}
            
            {/* Loading Overlay saat Kompresi */}
            {isCompressing && (
              <div className="absolute inset-0 bg-black/60 z-50 flex flex-col items-center justify-center text-white gap-2">
                <Loader2 className="animate-spin" size={32} />
                <p className="text-sm font-medium">Mengoptimalkan gambar...</p>
              </div>
            )}
          </div>

          <div className="py-2 space-y-2">
             <div className="flex justify-between text-xs text-slate-500">
                <span>Zoom</span>
                <span>{zoom.toFixed(1)}x</span>
             </div>
             <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                disabled={isCompressing}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
             />
          </div>

          <DialogFooter className="flex gap-2 sm:justify-end">
            <Button variant="outline" disabled={isCompressing} onClick={() => setIsCropModalOpen(false)}>
                Batal
            </Button>
            <Button onClick={handleCropSave} disabled={isCompressing} className="gap-2">
                {isCompressing ? "Memproses..." : <><Check size={16} /> Gunakan Foto</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* --------------------- */}

      <Card className="flex flex-col h-full shadow-sm border-slate-200">
        <CardHeader className="pb-4 pt-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <User size={20} />
            </div>
            <CardTitle className="text-lg">Identitas Pengguna</CardTitle>
          </div>
          <CardDescription>Informasi akun dan foto profil Anda.</CardDescription>
        </CardHeader>

        <form onSubmit={handleProfileUpdate} className="flex flex-col flex-1">
          <CardContent className="space-y-6 flex-1">
            
            {/* Bagian Foto Profil */}
            <div className="flex flex-col items-center justify-center gap-4 py-2">
                <div className="relative group">
                    <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-slate-50 shadow-sm relative bg-slate-100">
                        {previewImage ? (
                             <Image 
                                src={previewImage} 
                                alt="Foto Profil" 
                                fill 
                                className="object-cover"
                                unoptimized={!!fileToUpload} 
                             />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                <User size={48} />
                            </div>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-1 right-1 bg-blue-600 text-white p-2 rounded-full shadow-md hover:bg-blue-700 transition-all transform hover:scale-105"
                        title="Ubah Foto"
                    >
                        <Camera size={16} />
                    </button>
                </div>
                
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" // Terima semua gambar
                    onChange={handleFileChange}
                />
                
                {fileToUpload && (
                    <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full animate-pulse">
                        Foto siap disimpan
                    </span>
                )}
            </div>

            {/* Form Fields Lainnya (Sama seperti sebelumnya) */}
            <div className="space-y-2">
              <Label htmlFor="username" className="text-slate-600">Username</Label>
              <Input
                id="username"
                value={formData.username}
                disabled={true} 
                className="bg-slate-50 text-slate-500 pl-3 border-slate-200"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nama" className="text-slate-700">Nama Lengkap</Label>
              <Input
                id="nama"
                value={formData.nama}
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              />
            </div>

            {user.role === "mahasiswa" && (
                <div className="space-y-2">
                  <Label htmlFor="alamat" className="text-slate-700">Alamat Domisili</Label>
                  <Textarea
                    id="alamat"
                    rows={3}
                    className="resize-none"
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                  />
                </div>
            )}
          </CardContent>

          <CardFooter className="bg-slate-50/50 border-t border-slate-100 p-4 mt-auto">
            <Button type="submit" disabled={isSaving || isCompressing} className="w-full sm:w-auto ml-auto gap-2">
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}