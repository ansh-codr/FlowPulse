import { create } from "zustand";

export type ActivityEvent = {
  id?: number;
  ts: string;
  url: string;
  title: string | null;
  active_seconds: number;
  is_idle: boolean;
};

type ActivityState = {
  events: ActivityEvent[];
  addEvent: (evt: ActivityEvent) => void;
  setEvents: (evts: ActivityEvent[]) => void;
};

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],
  addEvent: (evt) => set((state) => ({ events: [evt, ...state.events].slice(0, 500) })),
  setEvents: (evts) => set(() => ({ events: evts })),
}));
