import { NavLink, Outlet } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";

const nav = [
  { label: "Overview", to: "/" },
  { label: "Timeline", to: "/timeline" },
  { label: "Heatmap", to: "/heatmap" },
  { label: "Top Apps", to: "/top-apps" },
  { label: "Sessions", to: "/sessions" },
  { label: "Leaderboard", to: "/leaderboard" },
  { label: "Settings", to: "/settings" },
];

export function DashboardLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="grid min-h-screen grid-cols-[220px_1fr] bg-night/95 text-white">
      <aside className="flex flex-col gap-6 border-r border-white/5 bg-gradient-to-b from-white/5 to-transparent p-6">
        <div>
          <p className="font-display text-2xl tracking-tight text-white">FlowPulse</p>
          <p className="text-xs uppercase tracking-[0.5em] text-white/50">Intelligence</p>
        </div>
        <nav className="flex flex-col gap-2">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                `rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? "bg-white/10 text-white shadow-glow"
                    : "text-white/60 hover:bg-white/5"
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User info */}
        {user && (
          <div className="mt-auto space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt=""
                  className="h-8 w-8 rounded-full"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-aurora/30 text-sm font-bold text-white">
                  {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user.displayName ?? "User"}
                </p>
                <p className="truncate text-xs text-white/50">{user.email}</p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60 hover:bg-white/10 hover:text-white"
            >
              Sign Out
            </button>
          </div>
        )}
      </aside>
      <main className="relative overflow-hidden">
        <motion.div
          className="pointer-events-none absolute inset-0 opacity-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
        >
          <div className="parallax absolute -left-24 top-0 h-72 w-72 rounded-full bg-plasma/30 blur-3xl" />
          <div className="parallax absolute right-0 top-64 h-96 w-96 rounded-full bg-aurora/20 blur-3xl" />
        </motion.div>
        <section className="relative z-10 min-h-screen p-10">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
