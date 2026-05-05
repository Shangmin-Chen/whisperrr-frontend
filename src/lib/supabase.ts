import { createClient, SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!url?.trim() || !publishableKey?.trim()) {
  throw new Error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_PUBLISHABLE_KEY. Add them to .env.local (see docs).'
  );
}

/**
 * Single browser Supabase client. URL and publishable key are inlined at build time via Vite;
 * the publishable (anon) key is meant to be public in the bundle.
 */
export const supabase: SupabaseClient = createClient(url, publishableKey);
