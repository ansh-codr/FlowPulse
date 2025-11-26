import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
export default function SettingsPage() {
    const [timezone, setTimezone] = useState("UTC");
    const [domains, setDomains] = useState([]);
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
        if (!newDomain)
            return;
        setDomains((prev) => Array.from(new Set([...prev, newDomain])));
        setNewDomain("");
    }
    async function saveSettings() {
        setSaving(true);
        await supabase.from("app_settings").upsert({ timezone, distraction_domains: domains });
        setSaving(false);
    }
    return (_jsxs("main", { className: "min-h-screen px-6 py-10 lg:px-16 space-y-6", children: [_jsxs("header", { children: [_jsx("h1", { className: "text-3xl font-semibold", children: "Settings" }), _jsx("p", { className: "text-slate-400", children: "Adjust distraction filters and timezone." })] }), _jsxs("section", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsx("h2", { className: "text-lg font-medium mb-4", children: "Timezone" }), _jsx("input", { className: "w-full rounded-2xl bg-slate-900/50 border border-white/10 px-4 py-3 outline-none", value: timezone, onChange: (e) => setTimezone(e.target.value) })] }), _jsxs("section", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass space-y-4", children: [_jsx("h2", { className: "text-lg font-medium", children: "Distraction domains" }), _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { className: "flex-1 rounded-2xl bg-slate-900/50 border border-white/10 px-4 py-3 outline-none", placeholder: "example.com", value: newDomain, onChange: (e) => setNewDomain(e.target.value) }), _jsx("button", { className: "rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-4", onClick: addDomain, children: "Add" })] }), _jsx("div", { className: "flex flex-wrap gap-2", children: domains.map((domain) => (_jsx("span", { className: "px-3 py-1 rounded-full bg-white/10 text-xs", children: domain }, domain))) })] }), _jsx("button", { className: "rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 px-6 py-3", onClick: saveSettings, disabled: saving, children: saving ? "Saving..." : "Save settings" })] }));
}
