import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/Home";
import { TimelinePage } from "./pages/Timeline";
import { HeatmapPage } from "./pages/Heatmap";
import { TopAppsPage } from "./pages/TopApps";
import { SessionsPage } from "./pages/Sessions";
import { SettingsPage } from "./pages/SettingsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-night">
        <div className="relative flex h-16 w-16 items-center justify-center">
          {/* Outer spinning ring */}
          <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-neon border-r-neon/30" />
          {/* Logo */}
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-plasma to-aurora shadow-glow-plasma">
            <span className="font-display text-sm font-bold text-white">FP</span>
          </div>
        </div>
        <div className="text-center">
          <p className="font-display text-lg font-semibold text-white">FlowPulse</p>
          <p className="mt-1 text-xs uppercase tracking-[0.4em] text-white/30">Initializing…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-night">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-neon border-t-transparent" />
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <LoginPage />}
      />
      <Route
        path="/"
        element={
          <AuthGuard>
            <DashboardLayout />
          </AuthGuard>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="timeline" element={<TimelinePage />} />
        <Route path="heatmap" element={<HeatmapPage />} />
        <Route path="top-apps" element={<TopAppsPage />} />
        <Route path="sessions" element={<SessionsPage />} />
        <Route path="leaderboard" element={<LeaderboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
