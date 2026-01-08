"use client";

import React, { useState, useRef, useCallback } from "react";
import { User, MapPin, Save, Camera, Loader2, Check, UserCircle, AtSign } from "lucide-react"; 
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

// Library
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage"; 
import imageCompression from "browser-image-compression"; 

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
  const [isProcessing, setIsProcessing] = useState(false); 
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

  // --- HELPER & LOGIC SAMA SEPERTI SEBELUMNYA ---
  const handleSystemError = (error: any, defaultMsg: string) => {
    console.error("System Error:", error); 
    let userMessage = defaultMsg;
    const msg = error?.message?.toLowerCase() || "";
    if (msg.includes("limit") || msg.includes("size")) userMessage = "Ukuran berkas melebihi batas.";
    else if (msg.includes("network")) userMessage = "Gagal terhubung ke server.";
    return userMessage;
  };

  const processImage = async (file: File): Promise<File> => {
    const options = { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true, fileType: "image/jpeg", initialQuality: 0.9 };
    try {
      setIsProcessing(true);
      const processedFile = await imageCompression(file, options);
      return new File([processedFile], file.name, { type: processedFile.type });
    } catch { return file; } finally { setIsProcessing(false); }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) { 
         toast.error("Berkas terlalu besar"); return;
      }
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || null);
        setIsCropModalOpen(true); setZoom(1); setCrop({ x: 0, y: 0 }); 
      });
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((_: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCropSave = async () => {
    try {
      if (!imageSrc || !croppedAreaPixels) return;
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedBlob) throw new Error("Crop failed");
      const finalFile = await processImage(new File([croppedBlob], "avatar.jpg", { type: "image/jpeg" }));
      setFileToUpload(finalFile);
      setPreviewImage(URL.createObjectURL(finalFile));
      setIsCropModalOpen(false); setImageSrc(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; 
      toast.success("Foto Siap", { description: "Klik 'Simpan Perubahan' untuk menerapkan." });
    } catch (e) {
      toast.error("Gagal memproses gambar");
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalAvatarUrl = formData.avatar_url;
      if (fileToUpload) {
        const fd = new FormData(); fd.append("file", fileToUpload); fd.append("username", user.username); 
        finalAvatarUrl = await uploadAvatar(fd, user.avatar_url);
      }
      await updateUserSettings(user.username, {
        nama: formData.nama, username: formData.username, alamat: formData.alamat, role: user.role, avatar_url: finalAvatarUrl, 
      });
      toast.success("Profil Diperbarui", { description: "Data Anda berhasil disimpan." });
      onUpdateSuccess({ name: formData.nama, username: formData.username, alamat: formData.alamat, avatar_url: finalAvatarUrl });
      setFileToUpload(null);
    } catch (error: any) {
      toast.error("Gagal Menyimpan", { description: handleSystemError(error, "Terjadi kesalahan.") });
    } finally { setIsSaving(false); }
  };

  return (
    <>
        {/* Modal Crop Tetap Sama, hanya styling disederhanakan di sini */}
        <Dialog open={isCropModalOpen} onOpenChange={(open) => !isProcessing && setIsCropModalOpen(open)}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden gap-0">
                <DialogHeader className="p-4 bg-slate-50 border-b">
                    <DialogTitle>Sesuaikan Foto</DialogTitle>
                    <DialogDescription>Geser dan zoom untuk hasil terbaik.</DialogDescription>
                </DialogHeader>
                <div className="relative w-full h-[300px] bg-black">
                    {imageSrc && <Cropper image={imageSrc} crop={crop} zoom={zoom} aspect={1} onCropChange={setCrop} onCropComplete={onCropComplete} onZoomChange={setZoom} />}
                    {isProcessing && <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>}
                </div>
                <div className="p-4 space-y-4">
                    <div className="flex items-center gap-4"><span className="text-xs text-slate-500">Zoom</span><input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(Number(e.target.value))} className="w-full h-1 bg-slate-200 rounded-lg cursor-pointer accent-blue-600"/></div>
                    <DialogFooter><Button variant="ghost" onClick={() => setIsCropModalOpen(false)}>Batal</Button><Button onClick={handleCropSave} disabled={isProcessing}>Gunakan Foto</Button></DialogFooter>
                </div>
            </DialogContent>
        </Dialog>

        {/* --- MAIN CARD --- */}
        <Card className="overflow-hidden border-slate-200 shadow-md bg-white">
            {/* Banner Header */}
            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
                <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10"></div>
            </div>

            <CardContent className="px-6 pb-6">
                <form onSubmit={handleProfileUpdate}>
                    <div className="flex flex-col sm:flex-row gap-6 items-start -mt-12 mb-6">
                        {/* Avatar Section */}
                        <div className="relative group mx-auto sm:mx-0">
                            <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-100 relative">
                                {previewImage ? (
                                    <Image src={previewImage} alt="Profile" fill className="object-cover" unoptimized={!!fileToUpload} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-300"><User size={64} /></div>
                                )}
                            </div>
                            <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-1 right-1 bg-white text-slate-700 p-2 rounded-full shadow border hover:bg-slate-50 transition-all" title="Ubah Foto">
                                <Camera size={16} />
                            </button>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        {/* Text Intro */}
                        <div className="flex-1 mt-14 sm:mt-12 text-center sm:text-left space-y-1">
                            <h2 className="text-2xl font-bold text-slate-800">{formData.nama || "Pengguna Baru"}</h2>
                            <p className="text-slate-500 font-medium">@{formData.username}</p>
                            <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 capitalize border border-blue-100">
                                    {user.role}
                                </span>
                            </div>
                        </div>

                        {/* Action Button (Desktop) */}
                        <div className="hidden sm:block mt-14">
                             <Button type="submit" disabled={isSaving || isProcessing} className="bg-blue-600 hover:bg-blue-700 shadow-md transition-all">
                                {isSaving ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Simpan Perubahan
                            </Button>
                        </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Form Inputs */}
                    <div className="space-y-6">
                        <div className="grid sm:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-slate-600 flex items-center gap-2">
                                    <AtSign size={14} /> Username
                                </Label>
                                <Input 
                                    id="username" 
                                    value={formData.username} 
                                    disabled={user.role !== "admin"} 
                                    onChange={(e) => setFormData({ ...formData, username: e.target.value })} 
                                    className="bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                                />
                                {user.role !== "admin" && <p className="text-[10px] text-slate-400 ml-1">Username tidak dapat diubah.</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="nama" className="text-slate-600 flex items-center gap-2">
                                    <UserCircle size={14} /> Nama Lengkap
                                </Label>
                                <Input 
                                    id="nama" 
                                    value={formData.nama} 
                                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
                                    className="border-slate-200 focus:border-blue-400 transition-all"
                                />
                            </div>
                        </div>

                        {user.role === "mahasiswa" && (
                            <div className="space-y-2">
                                <Label htmlFor="alamat" className="text-slate-600 flex items-center gap-2">
                                    <MapPin size={14} /> Alamat Domisili
                                </Label>
                                <Textarea 
                                    id="alamat" 
                                    rows={3} 
                                    value={formData.alamat} 
                                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })} 
                                    className="border-slate-200 focus:border-blue-400 resize-none transition-all"
                                    placeholder="Masukkan alamat lengkap..."
                                />
                            </div>
                        )}
                    </div>

                    {/* Mobile Button */}
                    <div className="block sm:hidden mt-8">
                         <Button type="submit" disabled={isSaving || isProcessing} className="w-full bg-blue-600 hover:bg-blue-700">
                            Simpan Perubahan
                        </Button>
                    </div>

                </form>
            </CardContent>
        </Card>
    </>
  );
}