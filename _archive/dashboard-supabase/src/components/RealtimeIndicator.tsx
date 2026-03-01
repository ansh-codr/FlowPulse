type Props = { connected: boolean };

export function RealtimeIndicator({ connected }: Props) {
  return (
    <div className="flex items-center gap-2 text-xs text-slate-400">
      <span
        className={`inline-flex h-2 w-2 rounded-full ${connected ? "bg-green-400 animate-pulse" : "bg-slate-500"}`}
      ></span>
      {connected ? "Live updates on" : "Realtime reconnecting"}
    </div>
  );
}
