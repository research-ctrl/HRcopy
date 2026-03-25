import { createClient } from "@supabase/supabase-js";

const url = process.env.SUPABASE_URL;
// Prefer service role key (server-side, bypasses RLS) — fall back to anon key
const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}

export function getSupabaseClient() {
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or SUPABASE_ANON_KEY) in your environment.",
    );
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}
