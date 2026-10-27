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
      <g className="spin-slow"><circle cx="50" cy="50" r="47" fill="none" stroke="#8ff3ff" strokeOpacity=".18" strokeDasharray="1 4" /></g>
      {Array.from({ length: total }, (_, i) => {
        const isTaken = i < taken;
        return (
          <path key={i} d={arc(i)} fill="none" strokeWidth="7" strokeLinecap="round"
            stroke={isTaken ? "#ffcf6b" : "#8ff3ff"}
            className={isTaken ? "" : "slot-free"}
            style={{ ["--i" as string]: i, filter: isTaken ? "drop-shadow(0 0 3px #ff8a3d)" : undefined, opacity: isTaken ? 1 : .7 }} />
        );
      })}
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill={left ? "#fff" : "#fb7185"} fontSize="22" fontWeight="700" fontFamily="var(--font-kufi)">{left}</text>
      <text x="50" y="68" textAnchor="middle" fill="#c7cdee" fontSize="7.5" fontFamily="var(--font-plex)">{left ? "متبقي" : "مكتمل"}</text>
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

// Layered mountain range for the hero; each ridge scrolls at a different depth.
export function Range() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[62%]">
      <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" className="ridge absolute inset-0 h-full w-full" style={{ ["--depth" as string]: -0.08 }}>
        <defs>
          <linearGradient id="r1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#2a2f63" /><stop offset="1" stopColor="#0b0e24" /></linearGradient>
          <radialGradient id="peakglow"><stop offset="0" stopColor="#ffcf6b" stopOpacity=".9" /><stop offset="1" stopColor="#ffcf6b" stopOpacity="0" /></radialGradient>
        </defs>
        <path d="M0 420 L180 300 L300 360 L470 200 L600 290 L720 70 L840 260 L980 180 L1120 320 L1260 240 L1440 380 L1440 600 L0 600Z" fill="url(#r1)" />
        <path d="M720 70 L760 130 L742 125 L728 150 L712 118 L690 128Z" fill="#e9f6ff" opacity=".85" />
        <circle cx="720" cy="66" r="70" fill="url(#peakglow)" className="beacon" />
        <circle cx="720" cy="66" r="5" fill="#fff6d6" />
      </svg>
      <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" className="ridge absolute inset-0 h-full w-full" style={{ ["--depth" as string]: -0.18 }}>
        <path d="M0 470 L140 400 L260 450 L420 330 L560 430 L690 380 L860 470 L1010 360 L1170 440 L1300 390 L1440 450 L1440 600 L0 600Z" fill="#11153a" />
      </svg>
      <svg viewBox="0 0 1440 600" preserveAspectRatio="xMidYMax slice" className="ridge absolute inset-0 h-full w-full" style={{ ["--depth" as string]: -0.3 }}>
        <path d="M0 540 L200 480 L380 530 L540 470 L720 540 L900 490 L1080 545 L1260 480 L1440 530 L1440 600 L0 600Z" fill="#070918" />
      </svg>
    </div>
  );
}

export function Avatar({ name, file, size = 72 }: { name: string; file?: string | null; size?: number }) {
  if (file) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={`/media/avatars/${file}`} alt={name} width={size} height={size} className="rounded-2xl object-cover ring-1 ring-white/20" style={{ width: size, height: size }} />;
  }
  return (
    <div className="grid place-items-center rounded-2xl bg-gradient-to-br from-ink to-deep font-display text-gold ring-1 ring-gold/40"
      style={{ width: size, height: size, fontSize: size * .38 }}>{name.slice(0, 2)}</div>
  );
}
