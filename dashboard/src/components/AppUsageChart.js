import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from "recharts";
const COLORS = ["#a855f7", "#22d3ee", "#f97316", "#38bdf8", "#e11d48"];
export function AppUsageChart({ events }) {
    const grouped = events.reduce((acc, evt) => {
        const domain = new URL(evt.url).hostname.replace("www.", "");
        acc[domain] = (acc[domain] ?? 0) + evt.active_seconds;
        return acc;
    }, {});
    const data = Object.entries(grouped)
        .map(([name, seconds]) => ({ name, value: Math.round(seconds / 60) }))
        .slice(0, 5);
    return (_jsxs("div", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsx("p", { className: "text-sm text-slate-300 mb-4", children: "Top apps" }), _jsx("div", { className: "h-56", children: _jsx(ResponsiveContainer, { children: _jsxs(PieChart, { children: [_jsx(Pie, { data: data, dataKey: "value", nameKey: "name", innerRadius: 50, outerRadius: 80, children: data.map((_entry, index) => (_jsx(Cell, { fill: COLORS[index % COLORS.length] }, `cell-${index}`))) }), _jsx(Tooltip, { contentStyle: { background: "#0f172a", border: "1px solid #1e293b" } })] }) }) }), _jsx("ul", { className: "text-xs text-slate-300 space-y-1", children: data.map((item) => (_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: item.name }), _jsxs("span", { children: [item.value, "m"] })] }, item.name))) })] }));
}
