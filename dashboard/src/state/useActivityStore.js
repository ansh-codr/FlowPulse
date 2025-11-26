import { create } from "zustand";
export const useActivityStore = create((set) => ({
    events: [],
    addEvent: (evt) => set((state) => ({ events: [evt, ...state.events].slice(0, 500) })),
    setEvents: (evts) => set(() => ({ events: evts })),
}));
