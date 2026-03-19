import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { ImmersiveLanding } from "./landing/immersive/ImmersiveLanding";
import { LoginPage } from "./pages/LoginPage";
import { HomePage } from "./pages/Home";
import { TimelinePage } from "./pages/Timeline";
import { HeatmapPage } from "./pages/Heatmap";
import { TopAppsPage } from "./pages/TopApps";
import { SessionsPage } from "./pages/Sessions";
import { SettingsPage } from "./pages/SettingsPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { ExtensionDownloadPage } from "./pages/ExtensionDownloadPage";
import { InsightsPage } from "./pages/InsightsPage";
import { GlobalBackground } from "./components/GlobalBackground";

const LoadingScreen = () => (
  <div className="flex min-h-screen flex-col items-center justify-center gap-6">
    <div className="relative flex h-16 w-16 items-center justify-center">
      <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-white border-r-white/30" />
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)] backdrop-blur-md">
        <span className="font-display text-sm font-bold text-white">FP</span>
      </div>
    </div>
    <div className="text-center">
      <p className="font-display text-lg font-semibold text-white">FlowPulse</p>
      <p className="mt-1 text-xs uppercase tracking-[0.4em] text-white/30">Initializing…</p>
    </div>
  </div>
);

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/app" replace /> : <ImmersiveLanding />} />
      <Route
        path="/login"
        element={user ? <Navigate to="/app" replace /> : <LoginPage />}
      />
      <Route
        path="/extension"
        element={
          <AuthGuard>
            <ExtensionDownloadPage />
          </AuthGuard>
        }
      />
      <Route
        path="/app"
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
        <Route path="insights" element={<InsightsPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <GlobalBackground />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
