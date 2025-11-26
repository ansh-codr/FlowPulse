import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

console.log('Supabase Config:', { 
  url: url ? `✓ Set (${url.substring(0, 30)}...)` : '✗ Missing', 
  anonKey: anonKey ? '✓ Set' : '✗ Missing',
  allEnvVars: import.meta.env
});

if (!url || !anonKey) {
  const errorMsg = `Missing Supabase credentials! 
    URL: ${url || 'NOT SET'} 
    Key: ${anonKey ? 'SET' : 'NOT SET'}
    
    Please set environment variables in Netlify:
    - VITE_SUPABASE_URL
    - VITE_SUPABASE_ANON_KEY`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validate URL format
try {
  new URL(url);
} catch (e) {
  const errorMsg = `Invalid VITE_SUPABASE_URL format: "${url}". Must be a valid URL starting with https://`;
  console.error(errorMsg);
  throw new Error(errorMsg);
}

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
  },
});
