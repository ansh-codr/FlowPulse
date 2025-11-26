import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL || '';
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Debug: Log all environment variables
console.log('=== ENVIRONMENT DEBUG ===');
console.log('All import.meta.env:', import.meta.env);
console.log('VITE_SUPABASE_URL:', url);
console.log('VITE_SUPABASE_ANON_KEY:', anonKey ? `${anonKey.substring(0, 20)}...` : 'MISSING');
console.log('========================');

if (!url || !anonKey) {
  const errorMsg = `❌ Missing Supabase credentials! 
    URL: "${url}" ${!url ? '❌ NOT SET' : '✓'} 
    Key: ${anonKey ? '✓ SET' : '❌ NOT SET'}
    
    🔧 Fix in Netlify:
    1. Go to Site settings → Environment variables
    2. Add manually (not import):
       - VITE_SUPABASE_URL = https://glaxxuhfksarxauufyco.supabase.co
       - VITE_SUPABASE_ANON_KEY = (your JWT token)
    3. Clear cache and redeploy`;
  console.error(errorMsg);
  alert(errorMsg); // Show alert so you can see the error immediately
  throw new Error(errorMsg);
}

// Validate URL format
try {
  new URL(url);
  console.log('✅ URL validation passed');
} catch (e) {
  const errorMsg = `❌ Invalid VITE_SUPABASE_URL format: "${url}". Must start with https://`;
  console.error(errorMsg);
  alert(errorMsg);
  throw new Error(errorMsg);
}

console.log('✅ Supabase client initialization successful');

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
  },
});
