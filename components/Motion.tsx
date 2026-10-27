"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// Reveal-on-scroll for [data-reveal], the --scroll CSS var for parallax, and the 3D tilt on .tilt cards.
export function MotionRuntime() {
  const path = usePathname();
  useEffect(() => {
    const io = new IntersectionObserver(
      (es) => es.forEach((e) => e.isIntersecting && (e.target.classList.add("shown"), io.unobserve(e.target))),
      { threshold: 0.12 },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.shown)").forEach((el) => io.observe(el));
    scan();
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => document.documentElement.style.setProperty("--scroll", String(scrollY)));
    };
    addEventListener("scroll", onScroll, { passive: true });

    const onMove = (e: PointerEvent) => {
      const card = (e.target as HTMLElement).closest?.(".tilt") as HTMLElement | null;
      document.querySelectorAll<HTMLElement>(".tilt").forEach((c) => {
        if (c !== card) { c.style.removeProperty("--rx"); c.style.removeProperty("--ry"); }
      });
      if (!card || e.pointerType !== "mouse") return;
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty("--ry", `${(x - .5) * 10}deg`);
      card.style.setProperty("--rx", `${(.5 - y) * 8}deg`);
      card.style.setProperty("--gx", `${x * 100}%`);
      card.style.setProperty("--gy", `${y * 100}%`);
    };
    addEventListener("pointermove", onMove);
    return () => { io.disconnect(); mo.disconnect(); removeEventListener("scroll", onScroll); removeEventListener("pointermove", onMove); };
  }, [path]);
  return null;
}

const TIERS = ["برونزي", "فضي", "ذهبي", "بلاتيني", "ماسي", "كراون", "إيس", "إيس ماستر", "إيس دومينيتور", "كونكر"];

// Altitude gauge: the whole page is a climb, scroll position = current rank.
export function AltitudeGauge() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => setP(Math.min(1, scrollY / Math.max(1, document.documentElement.scrollHeight - innerHeight)));
    on();
    addEventListener("scroll", on, { passive: true });
    return () => removeEventListener("scroll", on);
  }, []);
  const tier = TIERS[Math.min(TIERS.length - 1, Math.floor(p * TIERS.length))];
  const alt = Math.round(p * 8848);
  return (
    <div aria-hidden className="pointer-events-none fixed left-3 top-1/2 z-30 hidden -translate-y-1/2 lg:flex flex-col items-center gap-3">
      <span className="font-display text-[10px] tracking-widest text-ice/70 [writing-mode:vertical-rl]">الارتفاع</span>
      <div className="relative h-72 w-[3px] rounded bg-white/10">
        <div className="absolute bottom-0 w-full rounded bg-gradient-to-t from-glacier via-violet to-gold" style={{ height: `${p * 100}%` }} />
        {TIERS.map((_, i) => (
          <span key={i} className="absolute -left-1 h-px w-[11px] bg-white/30" style={{ bottom: `${(i / (TIERS.length - 1)) * 100}%` }} />
        ))}
        <div className="absolute -left-[7px] h-4 w-4 rotate-45 border border-gold bg-night shadow-[0_0_14px_#ffcf6b]" style={{ bottom: `calc(${p * 100}% - 8px)` }} />
      </div>
      <div className="text-center font-display leading-tight">
        <div className="text-sm text-gold">{tier}</div>
        <div className="text-[11px] text-mist/70" dir="ltr">{alt.toLocaleString("en")} m</div>
      </div>
    </div>
  );
}
