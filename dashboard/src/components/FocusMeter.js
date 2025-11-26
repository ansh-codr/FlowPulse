import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { GaugeChart } from "./GaugeChart";
export function FocusMeter({ score }) {
    return (_jsxs("div", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsx("p", { className: "text-sm text-slate-300", children: "Focus score" }), _jsx(GaugeChart, { score: score }), _jsx("p", { className: "text-xs text-slate-400", children: "Based on active vs idle minutes" })] }));
}
