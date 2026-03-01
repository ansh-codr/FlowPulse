import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { ActivityEvent, TimelineBlock } from "../../../shared/types";
import { mockApi } from "../mock/mockData";
import { GlassCard } from "../components/GlassCard";
import { FocusTimeline, ActiveBar } from "../components/charts";

export function TimelinePage() {
  const [blocks, setBlocks] = useState<TimelineBlock[]>([]);
  const [events, setEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    mockApi.getTimeline().then(setBlocks);
    mockApi.getEvents().then(setEvents);
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="font-display text-3xl text-white">Timeline View</h1>
      <GlassCard title="Chrono band" subtitle="Hour-by-hour signal">
        <FocusTimeline data={blocks} />
      </GlassCard>
      <GlassCard title="Activation" subtitle="Minutes active / hour">
        <ActiveBar data={blocks} />
      </GlassCard>
      <GlassCard title="Event Stream" subtitle="Synthesized from extension relay">
        <div className="grid gap-3">
          {events.map((event) => (
            <motion.div
              key={event.id}
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-sm"
              initial={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
            >
              <div>
                <p className="text-white font-semibold">{event.title}</p>
                <p className="text-white/60 text-xs">{new Date(event.start).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} • {event.url}</p>
              </div>
              <div className="text-right">
                <p className="text-neon text-lg font-bold">{event.focusScore}%</p>
                <p className="text-xs uppercase tracking-[0.3em] text-white/40">{event.category}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
