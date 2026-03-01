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
  const [summary, setSummary] = useState<{ active: number; idle: number; score: number }>({
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
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "activity_events" },
        (payload) => {
          setConnected(true);
          addEvent(payload.new as any);
        }
      )
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

  return (
    <main className="min-h-screen px-6 py-10 lg:px-16">
      <header className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back 👋</h1>
          <p className="text-slate-400">Here is your focus pulse for today.</p>
        </div>
        <RealtimeIndicator connected={connected} />
      </header>

      <section className="grid gap-6 lg:grid-cols-3">
        <FocusMeter score={summary.score} />
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
          <p className="text-sm text-slate-300">Totals today</p>
          <div className="flex gap-6 mt-6">
            <div>
              <p className="text-3xl font-semibold">{summary.active || totals.activeMinutes}m</p>
              <p className="text-xs text-slate-400">Active</p>
            </div>
            <div>
              <p className="text-3xl font-semibold">{summary.idle || totals.idleMinutes}m</p>
              <p className="text-xs text-slate-400">Idle</p>
            </div>
          </div>
        </div>
        <div className="rounded-3xl bg-white/5 border border-white/10 p-6 backdrop-blur shadow-glass">
          <p className="text-sm text-slate-300">Focus tips</p>
          <ul className="text-xs text-slate-300 space-y-2 mt-4">
            <li>Close tabs that consume &gt;20% of your focus.</li>
            <li>Schedule breaks every 90 minutes.</li>
            <li>Mute notifications during deep work windows.</li>
          </ul>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2 mt-8">
        <Timeline events={events} />
        <AppUsageChart events={events} />
      </section>

      <section className="mt-8">
        <Heatmap events={events} />
      </section>
    </main>
  );
}
