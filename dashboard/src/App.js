import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "./lib/useAuth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
import LandingPage from "./pages/LandingPage";
export default function App() {
    const { session, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center text-slate-200 bg-[#0D0D10]", children: "Loading FlowPulse..." }));
    }
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "p-8 bg-[#0D0D10] text-[#0055FF] h-screen w-screen", children: "Loading..." }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(LandingPage, {}) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/dashboard", element: session ? _jsx(DashboardPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/settings", element: session ? _jsx(SettingsPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) })] }) }));
}
