import { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { GlassCard } from "../components/GlassCard";
import {
  getUserSettings,
  updateUserSettings,
} from "../lib/firestoreQueries";
import type { UserSettings } from "../../../shared/types";

export function SettingsPage() {
  const { user, signOut } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    trackingEnabled: true,
    blockedDomains: [],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const [newDomain, setNewDomain] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!user) return;
    getUserSettings(user.uid).then(setSettings);
  }, [user]);

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    await updateUserSettings(user.uid, settings);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function addDomain() {
    const domain = newDomain.trim().toLowerCase();
    if (domain && !settings.blockedDomains.includes(domain)) {
      setSettings((s) => ({
        ...s,
        blockedDomains: [...s.blockedDomains, domain],
      }));
      setNewDomain("");
    }
  }

  function removeDomain(domain: string) {
    setSettings((s) => ({
      ...s,
      blockedDomains: s.blockedDomains.filter((d) => d !== domain),
    }));
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Settings</h1>

      {/* Profile */}
      <GlassCard title="Profile" subtitle="Your FlowPulse account">
        <div className="flex items-center gap-4">
          {user?.photoURL && (
            <img
              src={user.photoURL}
              alt=""
              className="h-12 w-12 rounded-full border border-white/10"
            />
          )}
          <div>
            <p className="font-semibold text-white">{user?.displayName}</p>
            <p className="text-sm text-white/60">{user?.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Tracking Toggle */}
      <GlassCard title="Tracking" subtitle="Extension data collection">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white">Enable tracking</p>
            <p className="text-sm text-white/60">
              When disabled, the extension stops recording activity
            </p>
          </div>
          <button
            onClick={() =>
              setSettings((s) => ({ ...s, trackingEnabled: !s.trackingEnabled }))
            }
            className={`relative h-8 w-14 rounded-full transition ${
              settings.trackingEnabled ? "bg-neon/30" : "bg-white/10"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full transition-all ${
                settings.trackingEnabled
                  ? "left-7 bg-neon"
                  : "left-1 bg-white/40"
              }`}
            />
          </button>
        </div>
      </GlassCard>

      {/* Blocked Domains */}
      <GlassCard
        title="Blocked Domains"
        subtitle="Always classified as distraction"
      >
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDomain()}
              placeholder="e.g. reddit.com"
              className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-neon/50"
            />
            <button
              onClick={addDomain}
              className="rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20"
            >
              Add
            </button>
          </div>
          {settings.blockedDomains.length === 0 ? (
            <p className="text-sm text-white/40">No blocked domains yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {settings.blockedDomains.map((domain) => (
                <span
                  key={domain}
                  className="flex items-center gap-2 rounded-full border border-ember/30 bg-ember/10 px-3 py-1 text-sm text-ember"
                >
                  {domain}
                  <button
                    onClick={() => removeDomain(domain)}
                    className="text-white/60 hover:text-white"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Timezone */}
      <GlassCard title="Timezone" subtitle="Used for daily aggregation">
        <input
          type="text"
          value={settings.timezone}
          onChange={(e) =>
            setSettings((s) => ({ ...s, timezone: e.target.value }))
          }
          className="w-full max-w-sm rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white outline-none focus:border-neon/50"
        />
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="rounded-2xl border border-neon/30 bg-neon/10 px-8 py-3 text-sm font-semibold text-neon transition hover:bg-neon/20 disabled:opacity-50"
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Settings"}
        </button>
        <button
          onClick={signOut}
          className="rounded-2xl border border-ember/30 bg-ember/10 px-8 py-3 text-sm font-semibold text-ember transition hover:bg-ember/20"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
