"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Lock, User, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username");
    const password = formData.get("password");

    // Simulasi delay login
    if (username && password) {
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } else {
      setError("Mohon lengkapi Username dan Password");
      setLoading(false);
    }
  };

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      
      {/* BAGIAN KIRI: Branding (Desktop Only) */}
      <div className="hidden lg:flex flex-col justify-between bg-[#1B3F95] p-16 text-white relative overflow-hidden">
        
        {/* Dekorasi Background */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-[400px] w-[400px] rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-[300px] w-[300px] rounded-full bg-blue-400/20 blur-3xl" />

        {/* Brand Header */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="relative h-14 w-14 overflow-hidden rounded-xl bg-white shadow-lg p-2 flex items-center justify-center">
            <Image
                src="/img/logo-ikmi.png"
                alt="Logo IKMI"
                fill
                className="object-contain p-1"
                priority
            />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-wide">SIAKAD</h2>
            <p className="text-xs text-blue-200 font-medium tracking-widest uppercase">STMIK IKMI Cirebon</p>
          </div>
        </div>

        {/* Main Hero Text */}
        <div className="relative z-10 max-w-md space-y-6">
          <h1 className="text-5xl font-extrabold leading-tight tracking-tight">
            Portal Akademik <br />
            <span className="text-blue-200">Terintegrasi.</span>
          </h1>
          <p className="text-lg text-blue-100/80 leading-relaxed font-light">
            Sistem Informasi Akademik untuk pengelolaan data perkuliahan, nilai, dan administrasi akademik Civitas STMIK IKMI Cirebon.
          </p>
        </div>

        {/* Footer Kiri */}
        <div className="relative z-10 flex items-center gap-2 text-sm text-blue-200/60">
          <div className="h-px w-8 bg-blue-200/30" />
          <span>Academic Information System</span>
        </div>
      </div>

      {/* BAGIAN KANAN / MOBILE: Form Login */}
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-950 p-6 sm:p-12">
        <div className="w-full max-w-[380px] animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {/* Header Mobile (Logo & Judul) */}
          {/* mb-10 memberikan jarak cukup jauh ke inputan */}
          <div className="lg:hidden flex flex-col items-center space-y-4 mb-10">
            <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-white shadow-lg border border-slate-100 p-3">
              <Image
                src="/img/logo-ikmi.png"
                alt="Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="text-center space-y-1">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">
                SIAKAD
              </h1>
              <p className="text-sm text-slate-500 font-medium">STMIK IKMI Cirebon</p>
            </div>
          </div>

          {/* Header Desktop (Hanya Text) */}
          <div className="hidden lg:block space-y-2 mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Login Akun
            </h2>
            <p className="text-slate-500 dark:text-slate-400">
              Silakan masukkan kredensial Anda untuk masuk.
            </p>
          </div>

          <Card className="border-none shadow-none bg-transparent p-0">
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-5 p-0">
                
                {/* Error Alert */}
                {error && (
                  <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/10 dark:text-red-400 animate-pulse">
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                    <span className="font-medium">{error}</span>
                  </div>
                )}

                {/* Input Username */}
                <div className="space-y-2">
                  <Label htmlFor="username" className="text-slate-700 dark:text-slate-300 font-medium hidden lg:block">Username / ID</Label>
                  <div className="relative group transition-all duration-300">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                    <Input
                      id="username"
                      name="username"
                      placeholder="Username / NIM / NIDN"
                      type="text"
                      disabled={loading}
                      className="pl-10 h-12 lg:h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all rounded-xl lg:rounded-lg"
                      required
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center hidden lg:flex">
                    <Label htmlFor="password" className="text-slate-700 dark:text-slate-300 font-medium">Password</Label>
                    <a href="#" className="text-xs font-medium text-blue-600 hover:text-blue-500 hover:underline">
                      Lupa password?
                    </a>
                  </div>
                  <div className="relative group transition-all duration-300">
                    <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400 transition-colors group-focus-within:text-blue-600" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      disabled={loading}
                      className="pl-10 pr-10 h-12 lg:h-11 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-all rounded-xl lg:rounded-lg"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-4 lg:top-3.5 text-slate-400 hover:text-slate-600 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  {/* Link Lupa Password Mobile */}
                  <div className="flex justify-end lg:hidden mt-1">
                     <a href="#" className="text-xs font-medium text-blue-600">Lupa password?</a>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col gap-5 p-0 pt-8">
                <Button 
                  className="w-full h-12 lg:h-11 text-base font-semibold bg-[#1B3F95] hover:bg-[#15327a] shadow-lg shadow-blue-900/10 hover:shadow-blue-900/20 transition-all active:scale-[0.98] rounded-xl lg:rounded-md" 
                  type="submit" 
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memverifikasi...
                    </>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      Masuk Portal <ChevronRight className="h-4 w-4 opacity-70" />
                    </div>
                  )}
                </Button>
                
                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                  &copy; {new Date().getFullYear()} STMIK IKMI Cirebon.
                </p>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}