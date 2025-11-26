import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export function RealtimeIndicator({ connected }) {
    return (_jsxs("div", { className: "flex items-center gap-2 text-xs text-slate-400", children: [_jsx("span", { className: `inline-flex h-2 w-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-slate-500"}` }), connected ? "Live updates on" : "Realtime reconnecting"] }));
}
