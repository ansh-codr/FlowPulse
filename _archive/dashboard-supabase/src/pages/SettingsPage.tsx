// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SettingsPage() {
  const [timezone, setTimezone] = useState("UTC");
  const [domains, setDomains] = useState<string[]>([]);
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase
      .from("app_settings")
      .select("timezone, distraction_domains")
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTimezone(data.timezone);
          setDomains(data.distraction_domains ?? []);
        }
      });
  }, []);

  function addDomain() {
    if (!newDomain) return;
    setDomains((prev) => Array.from(new Set([...prev, newDomain])));
    setNewDomain("");
  }

  async function saveSettings() {
    setSaving(true);
    await supabase.from("app_settings").upsert({ timezone, distraction_domains: domains });
    setSaving(false);
  }

  return (
    <main className="min-h-screen px-6 py-10 lg:px-16 space-y-6">
      <header>
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-slate-400">Adjust distraction filters and timezone.</p>
      </header>

      <section className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
        <h2 className="text-lg font-medium mb-4">Timezone</h2>
        <input
          className="w-full rounded-2xl bg-slate-900/50 border border-white/10 px-4 py-3 outline-none"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
        />
      </section>

      <section className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass space-y-4">
        <h2 className="text-lg font-medium">Distraction domains</h2>
        <div className="flex gap-2">
          <input
            className="flex-1 rounded-2xl bg-slate-900/50 border border-white/10 px-4 py-3 outline-none"
            placeholder="example.com"
            value={newDomain}
            onChange={(e) => setNewDomain(e.target.value)}
          />
          <button className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4" onClick={addDomain}>
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {domains.map((domain) => (
            <span key={domain} className="px-3 py-1 rounded-full bg-white/10 text-xs">
              {domain}
            </span>
          ))}
        </div>
      </section>

      <button
        className="rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3"
        onClick={saveSettings}
        disabled={saving}
      >
        {saving ? "Saving..." : "Save settings"}
      </button>
    </main>
  );
}
