import { createClient } from '@supabase/supabase-js';

// Mengambil URL dan Key dari file .env
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Membuat client untuk berinteraksi dengan database
export const supabase = createClient(supabaseUrl, supabaseKey);