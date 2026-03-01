import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { GlassCard } from "../components/GlassCard";
import { getUserSettings, updateUserSettings } from "../lib/firestoreQueries";
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
    setTimeout(() => setSaved(false), 2500);
  }

  function addDomain() {
    const domain = newDomain.trim().toLowerCase();
    if (domain && !settings.blockedDomains.includes(domain)) {
      setSettings((s) => ({ ...s, blockedDomains: [...s.blockedDomains, domain] }));
      setNewDomain("");
    }
  }

  function removeDomain(domain: string) {
    setSettings((s) => ({ ...s, blockedDomains: s.blockedDomains.filter((d) => d !== domain) }));
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.4em] text-white/30">Configuration</p>
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">Settings</h1>
      </div>

      {/* Profile */}
      <GlassCard title="Profile" subtitle="Your FlowPulse account" accentColor="#9c6bff">
        <div className="flex items-center gap-4">
          {user?.photoURL ? (
            <div className="relative flex-shrink-0">
              <img src={user.photoURL} alt="" className="h-14 w-14 rounded-full" />
              <div className="absolute inset-0 rounded-full ring-2 ring-aurora/40" />
            </div>
          ) : (
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-aurora to-plasma text-lg font-bold text-white shadow-glow-aurora">
              {(user?.displayName ?? user?.email ?? "U")[0].toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{user?.displayName ?? "User"}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
          </div>
        </div>
      </GlassCard>

      {/* Tracking Toggle */}
      <GlassCard title="Tracking" subtitle="Extension data collection" accentColor="#58f0ff" delay={0.05}>
        <div className="flex items-center justify-between gap-6">
          <div>
            <p className="font-medium text-white">Enable tracking</p>
            <p className="mt-0.5 text-sm text-white/40">
              When disabled, the extension stops recording activity
            </p>
          </div>
          <motion.button
            onClick={() => setSettings((s) => ({ ...s, trackingEnabled: !s.trackingEnabled }))}
            className={`relative h-8 w-14 flex-shrink-0 rounded-full transition-colors ${settings.trackingEnabled ? "bg-neon/30" : "bg-white/10"
              }`}
            style={settings.trackingEnabled ? { boxShadow: "0 0 16px rgba(88,240,255,0.2)" } : {}}
            whileTap={{ scale: 0.95 }}
          >
            <motion.span
              className="absolute top-1 h-6 w-6 rounded-full shadow-md"
              style={{ background: settings.trackingEnabled ? "#58f0ff" : "rgba(255,255,255,0.3)" }}
              animate={{ left: settings.trackingEnabled ? "calc(100% - 28px)" : "4px" }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          </motion.button>
        </div>
      </GlassCard>

      {/* Blocked Domains */}
      <GlassCard title="Blocked Domains" subtitle="Always classified as distraction" accentColor="#ff8a8a" delay={0.1}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addDomain()}
              placeholder="e.g. reddit.com"
              className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white placeholder-white/20 outline-none transition focus:border-neon/40 focus:ring-2 focus:ring-neon/10"
            />
            <motion.button
              onClick={addDomain}
              className="rounded-xl border border-white/[0.10] bg-white/[0.07] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-white/[0.12]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
            >
              Add
            </motion.button>
          </div>

          {settings.blockedDomains.length === 0 ? (
            <p className="text-sm text-white/30">No blocked domains yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {settings.blockedDomains.map((domain) => (
                  <motion.span
                    key={domain}
                    className="flex items-center gap-2 rounded-full border border-ember/25 bg-ember/10 px-3 py-1 text-sm text-ember"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.2 }}
                  >
                    {domain}
                    <button
                      onClick={() => removeDomain(domain)}
                      className="text-ember/50 transition hover:text-ember"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </GlassCard>

      {/* Timezone */}
      <GlassCard title="Timezone" subtitle="Used for daily aggregation" accentColor="#f5c842" delay={0.15}>
        <input
          type="text"
          value={settings.timezone}
          onChange={(e) => setSettings((s) => ({ ...s, timezone: e.target.value }))}
          className="w-full max-w-sm rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm text-white outline-none transition focus:border-gold/40 focus:ring-2 focus:ring-gold/10"
        />
      </GlassCard>

      {/* Actions */}
      <div className="flex gap-3">
        <motion.button
          onClick={handleSave}
          disabled={saving}
          className="group relative overflow-hidden rounded-xl px-8 py-3 text-sm font-semibold text-white disabled:opacity-50"
          style={{
            background: saved
              ? "linear-gradient(135deg, rgba(74,222,128,0.3), rgba(74,222,128,0.15))"
              : "linear-gradient(135deg, rgba(88,240,255,0.2), rgba(109,109,255,0.15))",
            border: saved ? "1px solid rgba(74,222,128,0.3)" : "1px solid rgba(88,240,255,0.2)",
          }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/[0.08] to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          {saving ? "Saving…" : saved ? "✓ Saved!" : "Save Settings"}
        </motion.button>

        <motion.button
          onClick={signOut}
          className="rounded-xl border border-ember/25 bg-ember/10 px-8 py-3 text-sm font-semibold text-ember transition hover:bg-ember/20"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Sign Out
        </motion.button>
      </div>
    </div>
  );
}
