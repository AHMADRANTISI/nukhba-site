// NUKHBA crest: a hexagonal gold shield with an engraved "N" whose strokes rise like
// rank chevrons, crowned by a glinting star. The rim draws in once, then a light
// sweep crosses the shield every few seconds.
export function Crest({ size = 40, animated = true }: { size?: number; animated?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden className="shrink-0 overflow-visible">
      <defs>
        <linearGradient id="nk-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff4d1" />
          <stop offset=".35" stopColor="#e6c36a" />
          <stop offset=".65" stopColor="#a8823a" />
          <stop offset="1" stopColor="#f7e7b4" />
        </linearGradient>
        <linearGradient id="nk-face" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d1810" />
          <stop offset="1" stopColor="#070605" />
        </linearGradient>
        <linearGradient id="nk-sheen" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset=".5" stopColor="#fff" stopOpacity=".55" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <clipPath id="nk-clip"><polygon points="24,2 43,12.5 43,35.5 24,46 5,35.5 5,12.5" /></clipPath>
      </defs>

      {/* shield */}
      <polygon points="24,2 43,12.5 43,35.5 24,46 5,35.5 5,12.5" fill="url(#nk-face)" />
      <polygon points="24,2 43,12.5 43,35.5 24,46 5,35.5 5,12.5" fill="none" stroke="url(#nk-gold)" strokeWidth="1.6"
        className={animated ? "crest-rim" : undefined} />
      <polygon points="24,6.5 39,14.8 39,33.2 24,41.5 9,33.2 9,14.8" fill="none" stroke="#e6c36a" strokeOpacity=".28" strokeWidth=".6" />

      {/* the N: rising strokes like rank chevrons */}
      <path d="M15.5 33 V17.5 L32.5 31 V15" fill="none" stroke="url(#nk-gold)" strokeWidth="3.4" strokeLinecap="square" strokeLinejoin="miter" />
      <path d="M15.5 33 V17.5 L32.5 31 V15" fill="none" stroke="#fff6dc" strokeOpacity=".35" strokeWidth=".7" transform="translate(-.6 -.6)" />

      {/* crown star on the N's top */}
      <g transform="translate(32.5 11.5)">
        <path d="M0 -5 L1.1 -1.1 L5 0 L1.1 1.1 L0 5 L-1.1 1.1 L-5 0 L-1.1 -1.1Z" fill="#fff6dc" className={animated ? "crest-star" : undefined} />
      </g>

      {/* light sweep */}
      {animated && (
        <g clipPath="url(#nk-clip)">
          <rect x="-30" y="-10" width="18" height="70" fill="url(#nk-sheen)" transform="rotate(20)" className="crest-sheen" />
        </g>
      )}
    </svg>
  );
}

export default function Logo({ size = 40 }: { size?: number }) {
  return (
    <span className="flex items-center gap-2.5">
      <Crest size={size} />
      <span className="flex flex-col leading-none">
        <span className="text-aurora font-display text-2xl font-extrabold">نخبة</span>
        <span className="mt-1 text-[9px] font-bold tracking-[.42em] text-gold/80" dir="ltr">NUKHBA</span>
      </span>
    </span>
  );
}
