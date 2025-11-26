import { supabase } from "./supabase";

export async function signIn() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      skipBrowserRedirect: false,
    },
  });

  if (error) throw error;
  return data.session;
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export async function signOut() {
  await supabase.auth.signOut();
}
