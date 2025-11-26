import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
export function Timeline({ events }) {
    const data = [...events]
        .sort((a, b) => (a.ts > b.ts ? 1 : -1))
        .map((evt) => ({
        time: new Date(evt.ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        active: evt.is_idle ? 0 : evt.active_seconds,
        idle: evt.is_idle ? evt.active_seconds : 0,
    }));
    return (_jsxs("div", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("p", { className: "text-sm text-slate-300", children: "Focus timeline" }), _jsx("span", { className: "text-xs text-slate-400", children: "Last 3h" })] }), _jsx("div", { className: "h-48", children: _jsx(ResponsiveContainer, { width: "100%", height: "100%", children: _jsxs(AreaChart, { data: data, margin: { top: 10, right: 0, left: 0, bottom: 0 }, children: [_jsxs("defs", { children: [_jsxs("linearGradient", { id: "activeGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#22d3ee", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#22d3ee", stopOpacity: 0 })] }), _jsxs("linearGradient", { id: "idleGradient", x1: "0", y1: "0", x2: "0", y2: "1", children: [_jsx("stop", { offset: "5%", stopColor: "#f97316", stopOpacity: 0.8 }), _jsx("stop", { offset: "95%", stopColor: "#f97316", stopOpacity: 0 })] })] }), _jsx(XAxis, { dataKey: "time", stroke: "#94a3b8", fontSize: 10 }), _jsx(YAxis, { stroke: "#94a3b8", fontSize: 10, hide: true }), _jsx(Tooltip, { contentStyle: { background: "#0f172a", border: "1px solid #1e293b" } }), _jsx(Area, { type: "monotone", dataKey: "active", stroke: "#22d3ee", fill: "url(#activeGradient)" }), _jsx(Area, { type: "monotone", dataKey: "idle", stroke: "#f97316", fill: "url(#idleGradient)" })] }) }) })] }));
}
