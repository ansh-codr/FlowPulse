import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: false,
    storage: {
      getItem: async (key) => (await chrome.storage.local.get(key))[key],
      setItem: async (key, value) => chrome.storage.local.set({ [key]: value }),
      removeItem: async (key) => chrome.storage.local.remove(key),
    },
  },
});
