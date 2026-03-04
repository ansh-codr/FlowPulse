import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { GLASS_STYLE } from "../components/GlobalBackground";

function InputField({
  id, type, label, value, onChange, placeholder, disabled,
}: {
  id: string; type: string; label: string; value: string;
  onChange: (v: string) => void; placeholder?: string; disabled?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[11px] uppercase tracking-[0.25em] font-medium text-white/70">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 outline-none transition-all duration-300 disabled:opacity-40"
          style={{
            background: "rgba(255, 255, 255, 0.03)",
            border: `1px solid ${focused ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)"}`,
            boxShadow: focused ? `0 0 0 3px rgba(255,255,255,0.05), inset 0 1px 0 rgba(255,255,255,0.05)` : "none",
            backdropFilter: "blur(12px)",
          }}
        />
      </div>
    </div>
  );
}

export function LoginPage() {
  const { signIn, signInWithEmail, signUpWithEmail, loading } = useAuth();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill all required fields.");
      return;
    }
    setError("");
    try {
      if (tab === "login") {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.message || "An authentication error occurred.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden">

      {/* Ambient background glows for the login card specifically */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
        <div className="h-[600px] w-[600px] bg-white/5 blur-[120px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] relative z-10"
      >
        <div className="rounded-3xl p-8 overflow-hidden relative" style={GLASS_STYLE}>

          <div className="text-center mb-8 relative z-10">
            <div className="h-12 w-12 mx-auto rounded-xl bg-white/10 border border-white/20 flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(255,255,255,0.1)]">
              <span className="font-display font-bold text-lg text-white">FP</span>
            </div>
            <h1 className="font-display text-3xl font-black text-white tracking-tight mb-2">
              FlowPulse
            </h1>
            <p className="text-sm text-white/50 tracking-wide">
              Intelligence for deep work.
            </p>
          </div>

          <div className="flex gap-2 p-1 bg-white/5 rounded-xl mb-8 border border-white/10 relative z-10">
            {(["login", "signup"] as const).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className="flex-1 rounded-lg py-2.5 text-xs font-bold uppercase tracking-wider transition-all duration-300 relative"
                style={{
                  color: tab === t ? "#fff" : "rgba(255,255,255,0.4)"
                }}
              >
                {t}
                {tab === t && (
                  <motion.div
                    layoutId="tab"
                    className="absolute inset-0 bg-white/10 rounded-lg border border-white/20"
                    style={{ boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-5 relative z-10">
            <AnimatePresence mode="popLayout">
              {tab === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  <InputField
                    id="name"
                    type="text"
                    label="Display Name"
                    value={name}
                    onChange={setName}
                    placeholder="e.g. Robin Lee"
                    disabled={loading}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <InputField
              id="email"
              type="email"
              label="Email Address"
              value={email}
              onChange={setEmail}
              placeholder="you@domain.com"
              disabled={loading}
            />

            <InputField
              id="password"
              type="password"
              label="Password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              disabled={loading}
            />

            {error && (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-lg bg-red-500/10 border border-red-500/20 p-3 text-xs text-red-200"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-white text-black py-4 text-sm font-bold uppercase tracking-widest transition-all hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] mt-4"
            >
              {loading ? "Authenticating..." : tab === "login" ? "Enter FlowPulse" : "Create Account"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4 relative z-10">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-[10px] uppercase tracking-widest text-white/40">OR LOG IN WITH</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button
            type="button"
            onClick={() => { setError(""); signIn().catch((err) => setError(err.message)); }}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-xl bg-white/5 border border-white/10 py-4 font-medium text-white transition-all hover:bg-white/10 hover:border-white/20 relative z-10"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="text-sm font-bold uppercase tracking-widest text-white/80">Google</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
