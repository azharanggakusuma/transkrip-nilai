
import { createClient } from "@/lib/supabase/server";

export async function verifyTurnstile(token: string) {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;

  if (!secretKey) {
    console.warn("Peringatan: TURNSTILE_SECRET_KEY tidak ditemukan.");
    return false;
  }

  const url = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
  const formData = new FormData();
  formData.append('secret', secretKey);
  formData.append('response', token);

  try {
    const result = await fetch(url, {
      body: formData,
      method: 'POST',
    });

    const outcome = await result.json();
    return outcome.success;
  } catch (e) {
    console.error("Turnstile verification error:", e);
    return false;
  }
}
