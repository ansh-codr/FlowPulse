import { supabase } from "./supabase";

export async function signIn(email: string) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: chrome.runtime.getURL("callback.html"),
    },
  });

  if (error) throw error;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
