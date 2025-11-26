import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useActivityStore } from "../state/useActivityStore";
import { FocusMeter } from "../components/FocusMeter";
import { Timeline } from "../components/Timeline";
import { Heatmap } from "../components/Heatmap";
import { AppUsageChart } from "../components/AppUsageChart";
import { RealtimeIndicator } from "../components/RealtimeIndicator";
export default function DashboardPage() {
    const { events, setEvents, addEvent } = useActivityStore();
    const [connected, setConnected] = useState(false);
    const [summary, setSummary] = useState({
        active: 0,
        idle: 0,
        score: 0,
    });
    useEffect(() => {
        supabase
            .from("activity_events")
            .select("*")
            .order("ts", { ascending: false })
            .limit(200)
            .then(({ data }) => setEvents(data ?? []));
        supabase
            .from("daily_summary")
            .select("total_active_minutes, total_idle_minutes, focus_score")
            .order("summary_date", { ascending: false })
            .limit(1)
            .then(({ data }) => {
            if (data?.length) {
                setSummary({
                    active: data[0].total_active_minutes,
                    idle: data[0].total_idle_minutes,
                    score: data[0].focus_score,
                });
            }
        });
        const channel = supabase
            .channel("activity-events")
            .on("postgres_changes", { event: "INSERT", schema: "public", table: "activity_events" }, (payload) => {
            setConnected(true);
            addEvent(payload.new);
        })
            .subscribe((status) => {
            setConnected(status === "SUBSCRIBED");
        });
        return () => {
            supabase.removeChannel(channel);
        };
    }, [addEvent, setEvents]);
    const totals = useMemo(() => {
        const activeSeconds = events.filter((e) => !e.is_idle).reduce((acc, evt) => acc + evt.active_seconds, 0);
        const idleSeconds = events.filter((e) => e.is_idle).reduce((acc, evt) => acc + evt.active_seconds, 0);
        return { activeMinutes: Math.round(activeSeconds / 60), idleMinutes: Math.round(idleSeconds / 60) };
    }, [events]);
    return (_jsxs("main", { className: "min-h-screen px-6 py-10 lg:px-16", children: [_jsxs("header", { className: "flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-8", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-semibold", children: "Welcome back \uD83D\uDC4B" }), _jsx("p", { className: "text-slate-400", children: "Here is your focus pulse for today." })] }), _jsx(RealtimeIndicator, { connected: connected })] }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-3", children: [_jsx(FocusMeter, { score: summary.score }), _jsxs("div", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsx("p", { className: "text-sm text-slate-300", children: "Totals today" }), _jsxs("div", { className: "flex gap-6 mt-6", children: [_jsxs("div", { children: [_jsxs("p", { className: "text-3xl font-semibold", children: [summary.active || totals.activeMinutes, "m"] }), _jsx("p", { className: "text-xs text-slate-400", children: "Active" })] }), _jsxs("div", { children: [_jsxs("p", { className: "text-3xl font-semibold", children: [summary.idle || totals.idleMinutes, "m"] }), _jsx("p", { className: "text-xs text-slate-400", children: "Idle" })] })] })] }), _jsxs("div", { className: "rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass", children: [_jsx("p", { className: "text-sm text-slate-300", children: "Focus tips" }), _jsxs("ul", { className: "text-xs text-slate-300 space-y-2 mt-4", children: [_jsx("li", { children: "Close tabs that consume >20% of your focus." }), _jsx("li", { children: "Schedule breaks every 90 minutes." }), _jsx("li", { children: "Mute notifications during deep work windows." })] })] })] }), _jsxs("section", { className: "grid gap-6 lg:grid-cols-2 mt-8", children: [_jsx(Timeline, { events: events }), _jsx(AppUsageChart, { events: events })] }), _jsx("section", { className: "mt-8", children: _jsx(Heatmap, { events: events }) })] }));
}
