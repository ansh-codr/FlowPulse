import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Navigate, Route, Routes } from "react-router-dom";
import { Suspense } from "react";
import { useAuth } from "./lib/useAuth";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import SettingsPage from "./pages/SettingsPage";
export default function App() {
    const { session, loading } = useAuth();
    if (loading) {
        return (_jsx("div", { className: "min-h-screen flex items-center justify-center text-slate-200", children: "Loading FlowPulse..." }));
    }
    return (_jsx(Suspense, { fallback: _jsx("div", { className: "p-8", children: "Loading..." }), children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/", element: session ? _jsx(DashboardPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/settings", element: session ? _jsx(SettingsPage, {}) : _jsx(Navigate, { to: "/login", replace: true }) })] }) }));
}
