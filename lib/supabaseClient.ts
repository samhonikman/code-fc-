import { createClient, SupabaseClient } from '@supabase/supabase-js';

let browserClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  if (typeof window === 'undefined') {
    // Server-side callers can use a short-lived instance.
    return createClient(url, anon);
  }

  // Reuse a single client in the browser to avoid multiple GoTrueClient instances.
  if (!browserClient) {
    browserClient = createClient(url, anon);
  }
  return browserClient;
}

export default getSupabaseClient;
