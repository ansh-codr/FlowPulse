import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "./lib/useAuth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-200">
        Loading FlowPulse...
      </div>
    );
  }

  return (
    <Suspense fallback={<div className="p-8">Loading...</div>}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/"
          element={session ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={session ? <SettingsPage /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </Suspense>
  );
}
