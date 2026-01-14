import { createBrowserClient } from '@supabase/ssr';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Please connect to Supabase using the "Connect to Supabase" button in the top right corner');
}

export const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);