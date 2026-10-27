import { STATUS } from "@/lib/core";

const TONES: Record<string, string> = {
  amber: "bg-amber-400/15 text-amber-300",
  sky: "bg-sky-400/15 text-sky-300",
  violet: "bg-violet/15 text-violet",
  cyan: "bg-ice/15 text-ice",
  gold: "bg-gold/20 text-gold",
  rose: "bg-rose/15 text-rose",
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] ?? { label: status, tone: "sky" };
  return <span className={`rounded-full px-3 py-1 text-xs font-medium ${TONES[s.tone]}`}>{s.label}</span>;
}
