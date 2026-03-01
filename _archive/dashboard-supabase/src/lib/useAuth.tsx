import { useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    }).catch(err => {
      console.warn('Could not fetch Supabase session (using dummy credentials)', err);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return { session, loading };
}
