type ActivityEvent = {
  ts: string;
  url: string;
  title?: string;
  active_seconds: number;
  is_idle: boolean;
};

type FlushResult = { inserted: number };

const STORAGE_KEY = "flowpulse_event_queue";
const FUNCTION_URL = import.meta.env.VITE_SUPABASE_FUNCTION_URL;

class EventBatcher {
  private queue: ActivityEvent[] = [];
  private flushing = false;
  private timer?: number;

  constructor(private flushIntervalMs = 30000, private maxBatchSize = 15) {
    this.restore();
  }

  private async restore() {
    const stored = await chrome.storage.local.get(STORAGE_KEY);
    if (stored[STORAGE_KEY]) {
      this.queue = stored[STORAGE_KEY];
    }
    this.schedule();
  }

  enqueue(event: ActivityEvent) {
    this.queue.push(event);
    this.persist();
    if (this.queue.length >= this.maxBatchSize) {
      this.flush();
    }
  }

  private schedule() {
    if (this.timer) globalThis.clearTimeout(this.timer);
    this.timer = globalThis.setTimeout(() => this.flush(), this.flushIntervalMs);
  }

  private persist() {
    chrome.storage.local.set({ [STORAGE_KEY]: this.queue });
  }

  async flush(token?: string) {
    if (this.flushing || this.queue.length === 0) {
      this.schedule();
      return;
    }

    const payload = [...this.queue];
    this.flushing = true;

    try {
      const res = await fetch(FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Failed to sync events: ${res.status}`);
      }

      const { inserted } = (await res.json()) as FlushResult;
      console.debug(`FlowPulse synced ${inserted} events`);
      this.queue = this.queue.slice(payload.length);
      this.persist();
    } catch (err) {
      console.error("FlowPulse flush failed", err);
    } finally {
      this.flushing = false;
      this.schedule();
    }
  }
}

export const batcher = new EventBatcher();
export type { ActivityEvent };
