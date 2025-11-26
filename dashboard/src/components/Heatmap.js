import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import clsx from "clsx";
const hours = Array.from({ length: 24 }, (_, i) => i);
function bucketMinutes(events) {
    const bucket = {};
    for (const evt of events) {
        const hour = new Date(evt.ts).getHours();
        bucket[hour] = (bucket[hour] ?? 0) + (evt.is_idle ? 0 : evt.active_seconds / 60);
    }
    return bucket;
}
export function Heatmap({ events }) {
    const bucket = bucketMinutes(events);
    const max = Math.max(...Object.values(bucket), 1);
    return (_jsxs("div", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsx("p", { className: "text-sm text-slate-300 mb-4", children: "Distraction heatmap" }), _jsx("div", { className: "grid grid-cols-6 gap-2 text-xs", children: hours.map((hour) => {
                    const value = bucket[hour] ?? 0;
                    const intensity = Math.min(1, value / max);
                    return (_jsxs("div", { className: clsx("h-10 rounded-xl flex flex-col justify-center items-center", intensity === 0
                            ? "bg-slate-800/50"
                            : "bg-gradient-to-br from-indigo-500/80 to-cyan-400/80"), children: [_jsxs("span", { children: [hour.toString().padStart(2, "0"), ":00"] }), _jsxs("span", { className: "text-[10px] text-white/70", children: [value.toFixed(0), "m"] })] }, hour));
                }) })] }));
}
