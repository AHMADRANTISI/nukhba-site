"use client";
import { useEffect, useRef } from "react";

// Full-page luxury backdrop: obsidian black, slow golden light beams from above,
// and drifting gold dust (soft bokeh + sharp glints) that catches the light.
export default function SkyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, t = 0;
    const dpr = Math.min(devicePixelRatio || 1, 2);

    type Mote = { x: number; y: number; r: number; vx: number; vy: number; a: number; p: number; bokeh: boolean };
    let motes: Mote[] = [];

    function mote(anywhere: boolean): Mote {
      const bokeh = Math.random() < 0.18;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 20,
        r: bokeh ? Math.random() * 10 + 6 : Math.random() * 1.4 + 0.3,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -(Math.random() * 0.25 + 0.05),
        a: bokeh ? Math.random() * 0.08 + 0.03 : Math.random() * 0.6 + 0.25,
        p: Math.random() * 7,
        bokeh,
      };
    }

    function resize() {
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      motes = Array.from({ length: Math.round((w * h) / 9000) }, () => mote(true));
    }

    // A soft beam fanning down from a point above the top edge.
    function beam(angle: number, width: number, alpha: number) {
      const ox = w * 0.5, oy = -h * 0.15, len = h * 1.5;
      const a0 = angle - width / 2, a1 = angle + width / 2;
      const g = ctx.createLinearGradient(ox, oy, ox, oy + len);
      g.addColorStop(0, `rgba(255,214,140,${alpha})`);
      g.addColorStop(0.55, `rgba(212,175,55,${alpha * 0.35})`);
      g.addColorStop(1, "rgba(212,175,55,0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(ox, oy);
      ctx.lineTo(ox + Math.sin(a0) * len, oy + Math.cos(a0) * len);
      ctx.lineTo(ox + Math.sin(a1) * len, oy + Math.cos(a1) * len);
      ctx.closePath();
      ctx.fill();
    }

    function frame() {
      t += 16;
      // obsidian base with a warm crown of light at the top
      const base = ctx.createLinearGradient(0, 0, 0, h);
      base.addColorStop(0, "#0c0a08");
      base.addColorStop(0.5, "#070608");
      base.addColorStop(1, "#040405");
      ctx.fillStyle = base;
      ctx.fillRect(0, 0, w, h);
      const crown = ctx.createRadialGradient(w / 2, -h * 0.1, 0, w / 2, -h * 0.1, Math.max(w, h) * 0.75);
      crown.addColorStop(0, "rgba(212,175,55,0.22)");
      crown.addColorStop(0.4, "rgba(140,100,40,0.07)");
      crown.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = crown;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      const sway = Math.sin(t * 0.00015);
      beam(-0.42 + sway * 0.05, 0.10, 0.05);
      beam(-0.16 + sway * 0.03, 0.06, 0.07);
      beam(0.05 - sway * 0.04, 0.13, 0.045);
      beam(0.30 - sway * 0.05, 0.07, 0.06);

      for (const m of motes) {
        m.x += m.vx + Math.sin((t + m.p * 900) * 0.0004) * 0.12;
        m.y += m.vy;
        if (m.y < -30) Object.assign(m, mote(false));
        const flicker = m.bokeh ? 1 : 0.55 + Math.sin(t * 0.003 + m.p) * 0.45;
        if (m.bokeh) {
          const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r);
          g.addColorStop(0, `rgba(255,220,150,${m.a})`);
          g.addColorStop(1, "rgba(255,220,150,0)");
          ctx.fillStyle = g;
        } else {
          ctx.fillStyle = `rgba(255,226,160,${m.a * flicker})`;
        }
        ctx.beginPath(); ctx.arc(m.x, m.y, m.r, 0, 7); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";

      // vignette keeps the edges deep and the centre glowing
      const v = ctx.createRadialGradient(w / 2, h * 0.45, Math.min(w, h) * 0.3, w / 2, h * 0.45, Math.max(w, h) * 0.8);
      v.addColorStop(0, "rgba(0,0,0,0)");
      v.addColorStop(1, "rgba(0,0,0,0.65)");
      ctx.fillStyle = v;
      ctx.fillRect(0, 0, w, h);

      if (!reduce) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
