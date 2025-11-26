import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('Supabase Config:', { 
  url: url ? '✓ Set' : '✗ Missing', 
  anonKey: anonKey ? '✓ Set' : '✗ Missing' 
});

if (!url || !anonKey) {
  console.error("Missing Supabase environment variables:", { url, anonKey });
  throw new Error("Missing Supabase credentials. Please check environment variables.");
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
  },
});
