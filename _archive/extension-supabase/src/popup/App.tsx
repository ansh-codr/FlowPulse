// @ts-nocheck
/* eslint-disable @typescript-eslint/no-explicit-any */
declare const chrome: any;
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!session) return;
    refreshSummary();
  }, [session]);

  async function refreshSummary() {
    setLoading(true);
    const today = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from("daily_summary")
      .select("total_active_minutes, total_idle_minutes, focus_score")
      .eq("summary_date", today)
      .maybeSingle();
    setSummary(data);
    setLoading(false);
  }

  async function handleLogin() {
    const email = prompt("Enter your email:");
    if (!email) return;
    
    try {
      await supabase.auth.signInWithOtp({ email });
      alert("Check your email for the magic link!");
    } catch (error) {
      alert("Failed to send magic link. Please try again.");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  function triggerSync() {
    setSyncStatus("Syncing...");
    chrome.runtime.sendMessage({ type: "FLOWPULSE_SYNC_NOW" }, (response: { ok: boolean }) => {
      setSyncStatus(response?.ok ? "Last sync just now" : "Sync failed");
    });
  }

  return (
    <div className="w-80 bg-slate-900 text-white p-4 font-sans space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">FlowPulse</h1>
          <p className="text-xs text-slate-400">Realtime focus tracking</p>
        </div>
        {session ? (
          <button className="text-xs underline" onClick={handleLogout}>
            Sign out
          </button>
        ) : (
          <button className="text-xs underline" onClick={handleLogin}>
            Sign in
          </button>
        )}
      </header>

      {session ? (
        <section className="rounded-lg bg-white/10 p-3 backdrop-blur">
          <p className="text-xs text-slate-300">Today</p>
          <div className="flex items-baseline gap-4 mt-1">
            <div>
              <p className="text-2xl font-bold">{summary?.focus_score ?? "--"}</p>
              <p className="text-xs text-slate-400">Focus score</p>
            </div>
            <div>
              <p className="text-sm">
                Active: {summary?.total_active_minutes ?? 0}m
              </p>
              <p className="text-sm">
                Idle: {summary?.total_idle_minutes ?? 0}m
              </p>
            </div>
          </div>
          <button
            className="mt-3 w-full rounded bg-indigo-500 py-1 text-sm"
            onClick={triggerSync}
          >
            Sync now
          </button>
          <p className="text-[10px] mt-1 text-slate-300">{syncStatus}</p>
        </section>
      ) : (
        <p className="text-sm text-slate-300">Sign in to start tracking.</p>
      )}

      <button
        className="w-full rounded border border-white/30 py-1 text-sm disabled:opacity-50"
        onClick={refreshSummary}
        disabled={loading || !session}
      >
        Refresh summary
      </button>
    </div>
  );
}
