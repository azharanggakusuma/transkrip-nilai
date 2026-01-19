-- SQL Script untuk update path menu Pengaturan
-- Jalankan di Query Editor Supabase atau tool database lainnya

UPDATE public.menus
SET href = '/pengaturan-akun',
    label = 'Pengaturan Akun'
WHERE href = '/pengaturan';
