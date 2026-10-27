import type { ServiceKey } from "@/lib/core";

const HUES: Record<ServiceKey, [string, string, string]> = {
  CLASSIC: ["#fff3c4", "#ffcf6b", "#ff8a3d"],
  ULTIMATE: ["#ede9fe", "#a78bfa", "#6d28d9"],
  METRO: ["#e0fbff", "#8ff3ff", "#0891b2"],
};

// A floating rank crystal with orbiting rings.
export function Crystal({ kind, size = 140 }: { kind: ServiceKey; size?: number }) {
  const [a, b, c] = HUES[kind];
  const id = `cr-${kind}`;
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" aria-hidden className="float">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={a} /><stop offset=".5" stopColor={b} /><stop offset="1" stopColor={c} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}><stop offset="0" stopColor={b} stopOpacity=".55" /><stop offset="1" stopColor={b} stopOpacity="0" /></radialGradient>
      </defs>
      <circle cx="100" cy="100" r="95" fill={`url(#${id}-glow)`} />
      <g className="spin-slow"><ellipse cx="100" cy="100" rx="86" ry="30" fill="none" stroke={b} strokeOpacity=".45" strokeDasharray="2 7" /></g>
      <g className="spin-rev"><circle cx="100" cy="100" r="70" fill="none" stroke={a} strokeOpacity=".25" strokeDasharray="30 12 4 12" /></g>
      <polygon points="100,22 142,78 100,178 58,78" fill={`url(#${id}-g)`} />
      <polygon points="100,22 142,78 100,96" fill="#fff" opacity=".35" />
      <polygon points="58,78 100,96 100,178" fill="#000" opacity=".22" />
      <polyline points="58,78 100,96 142,78" fill="none" stroke="#fff" strokeOpacity=".6" />
    </svg>
  );
}

// The 8-slot season sigil: each segment is one booking; taken ones blaze gold.
export function SigilRing({ total, taken, size = 92 }: { total: number; taken: number; size?: number }) {
  const left = Math.max(0, total - taken);
  const r = 38, gap = 6;
  const seg = 360 / total;
  const arc = (i: number) => {
    const a0 = ((i * seg + gap / 2 - 90) * Math.PI) / 180;
    const a1 = (((i + 1) * seg - gap / 2 - 90) * Math.PI) / 180;
    return `M ${50 + r * Math.cos(a0)} ${50 + r * Math.sin(a0)} A ${r} ${r} 0 0 1 ${50 + r * Math.cos(a1)} ${50 + r * Math.sin(a1)}`;
  };
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${left} حجوزات متبقية من ${total}`}>
      <g className="spin-slow"><circle cx="50" cy="50" r="47" fill="none" stroke="#f1e3bf" strokeOpacity=".22" strokeDasharray="1 4" /></g>
      {Array.from({ length: total }, (_, i) => {
        const isTaken = i < taken;
        return (
          <path key={i} d={arc(i)} fill="none" strokeWidth="7" strokeLinecap="round"
            stroke={isTaken ? "#e6c36a" : "#f1e3bf"}
            className={isTaken ? "" : "slot-free"}
            style={{ ["--i" as string]: i, filter: isTaken ? "drop-shadow(0 0 3px #d4af37)" : undefined, opacity: isTaken ? 1 : .28 }} />
        );
      })}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill={left ? "#fff6dc" : "#f08a8a"} fontSize="22" fontWeight="700" fontFamily="var(--font-kufi)">{left}</text>
      <text x="50" y="68" textAnchor="middle" fill="#bdb3a0" fontSize="7.5" fontFamily="var(--font-plex)">{left ? "متبقي" : "مكتمل"}</text>
    </svg>
  );
}

// Trust seal: a hexagon whose four facets light up per verification check.
export function TrustSeal({ score, size = 54 }: { score: number; size?: number }) {
  const full = score === 4;
  return (
    <svg width={size} height={size} viewBox="0 0 60 60" role="img" aria-label={`توثيق ${score} من 4`}>
      <polygon points="30,3 54,16 54,44 30,57 6,44 6,16" fill={full ? "#ffcf6b22" : "#ffffff08"} stroke={full ? "#ffcf6b" : "#ffffff40"} strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={15 + i * 8} y={40} width="6" height="4" rx="1" fill={i < score ? "#ffcf6b" : "#ffffff25"} />
      ))}
      <path d="M20 27 l7 7 l13 -14" fill="none" stroke={full ? "#ffcf6b" : "#c7cdee"} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// Gold line-art mountain ranges that draw themselves in, with a glint on the summit.
// Each ridge scrolls at a different depth.
const RIDGES = [
  { d: "M0 430 L160 330 L290 380 L470 210 L600 300 L720 90 L850 270 L990 190 L1130 330 L1270 250 L1440 380", depth: -0.08, w: 1.6, o: 1 },
  { d: "M0 480 L140 410 L260 455 L420 345 L560 435 L690 390 L860 470 L1010 370 L1170 445 L1300 400 L1440 455", depth: -0.18, w: 1.1, o: .55 },
  { d: "M0 545 L200 490 L380 535 L540 480 L720 545 L900 495 L1080 548 L1260 488 L1440 535", depth: -0.3, w: .9, o: .3 },
];

export function Range() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[44%]">
      {RIDGES.map((r, i) => (
        <svg key={i} viewBox="0 0 1440 600" preserveAspectRatio="none" className="ridge absolute inset-0 h-full w-full" style={{ ["--depth" as string]: r.depth }}>
          <defs>
            <linearGradient id={`rg${i}`} x1="0" x2="1">
              <stop offset="0" stopColor="#d4af37" stopOpacity="0" />
              <stop offset=".5" stopColor="#f7e7b4" />
              <stop offset="1" stopColor="#d4af37" stopOpacity="0" />
            </linearGradient>
            <linearGradient id={`rf${i}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#d4af37" stopOpacity={.07 * r.o} />
              <stop offset="1" stopColor="#000" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${r.d} L1440 600 L0 600Z`} fill={`url(#rf${i})`} />
          <path d={r.d} fill="none" stroke={`url(#rg${i})`} strokeWidth={r.w} vectorEffect="non-scaling-stroke" opacity={r.o}
            className="draw-in" style={{ animationDelay: `${.3 + i * .35}s` }} />
        </svg>
      ))}
      {/* summit glint sits exactly on the main peak (x 50%, y 90/600) */}
      <div className="ridge absolute left-1/2 top-[15%] -translate-x-1/2 -translate-y-1/2" style={{ ["--depth" as string]: -0.08 }}>
        <div className="beacon h-28 w-28 rounded-full bg-[radial-gradient(closest-side,#fff6dccc,#d4af3700)]" />
        <svg viewBox="-40 -40 80 80" className="spin-slow absolute inset-0 m-auto h-16 w-16">
          <path d="M0 -40 L4 -4 L40 0 L4 4 L0 40 L-4 4 L-40 0 L-4 -4Z" fill="#fff6dc" />
        </svg>
      </div>
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
    </div>
  );
}

// Slowly counter-rotating gold rings behind the hero title, like an engraved crest.
export function Halo() {
  return (
    <svg aria-hidden viewBox="0 0 600 600" className="pointer-events-none absolute -z-10 left-1/2 top-1/2 h-[min(92vw,640px)] w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 opacity-70">
      <defs>
        <linearGradient id="halo" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f7e7b4" stopOpacity=".7" />
          <stop offset=".5" stopColor="#d4af37" stopOpacity=".1" />
          <stop offset="1" stopColor="#f7e7b4" stopOpacity=".5" />
        </linearGradient>
      </defs>
      <g className="spin-slow"><circle cx="300" cy="300" r="290" fill="none" stroke="url(#halo)" strokeWidth=".8" strokeDasharray="1 7" /></g>
      <g className="spin-rev"><circle cx="300" cy="300" r="250" fill="none" stroke="url(#halo)" strokeWidth="1" /></g>
      <g className="spin-slow">
        <circle cx="300" cy="300" r="215" fill="none" stroke="#d4af37" strokeOpacity=".25" strokeWidth=".6" strokeDasharray="60 14 4 14" />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return <path key={i} d="M0 -5 L3 0 L0 5 L-3 0Z" fill="#f7e7b4" opacity=".7" transform={`translate(${300 + Math.cos(a) * 250} ${300 + Math.sin(a) * 250})`} />;
        })}
      </g>
    </svg>
  );
}

export function Avatar({ name, file, size = 72 }: { name: string; file?: string | null; size?: number }) {
  if (file) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/media/avatars/${file}`} alt={name} width={size} height={size} className="rounded-2xl object-cover ring-1 ring-white/20" style={{ width: size, height: size }} />;
  }
  return (
    <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-[#1a1510] to-black font-display text-gold ring-1 ring-gold/40"
      style={{ width: size, height: size, fontSize: size * .38 }}>{name.slice(0, 2)}</div>
  );
}
