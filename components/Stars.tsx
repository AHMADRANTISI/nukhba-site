// Read-only star row; partial stars are drawn by clipping a gold layer over a dim one.
export function Stars({ value, size = 16 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(5, value)) / 5 * 100;
  const row = (cls: string) => (
    <span className={`flex gap-[2px] ${cls}`}>
      {Array.from({ length: 5 }, (_, i) => <Star key={i} size={size} />)}
    </span>
  );
  return (
    <span className="relative inline-flex" role="img" aria-label={`${value.toFixed(1)} من 5`} dir="ltr">
      {row("text-white/15")}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>{row("text-gold drop-shadow-[0_0_4px_#ff8a3d88]")}</span>
    </span>
  );
}

export function Star({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden className="shrink-0">
      <path fill="currentColor" d="M12 2.5l2.9 6.1 6.6.8-4.9 4.6 1.3 6.6L12 17.3 6.1 20.6l1.3-6.6L2.5 9.4l6.6-.8z" />
    </svg>
  );
}

export type RatingSummary = { avg: number; count: number };
