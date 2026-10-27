"use client";
import { useEffect, useRef } from "react";

// Full-page night sky: twinkling stars, drifting aurora ribbons and snow/ember particles.
export default function SkyCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0, h = 0, raf = 0, t = 0;
    const dpr = Math.min(devicePixelRatio || 1, 2);

    type Star = { x: number; y: number; r: number; p: number };
    type Flake = { x: number; y: number; r: number; vy: number; vx: number; ember: boolean };
    let stars: Star[] = [];
    let flakes: Flake[] = [];

    function resize() {
      w = innerWidth; h = innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round((w * h) / 4200);
      stars = Array.from({ length: n }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.3 + .2, p: Math.random() * 6 }));
      flakes = Array.from({ length: Math.round(n / 5) }, () => newFlake(true));
    }
    function newFlake(anywhere = false): Flake {
      const ember = Math.random() < .25;
      return { x: Math.random() * w, y: anywhere ? Math.random() * h : ember ? h + 10 : -10, r: Math.random() * 1.8 + .4, vy: ember ? -(Math.random() * .6 + .2) : Math.random() * .6 + .25, vx: Math.random() * .4 - .2, ember };
    }

    function aurora(offset: number, color: string, amp: number, yBase: number) {
      const g = ctx.createLinearGradient(0, yBase - 160, 0, yBase + 120);
      g.addColorStop(0, "transparent");
      g.addColorStop(.5, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 24) {
        const y = yBase + Math.sin(x * .004 + t * .0006 + offset) * amp + Math.sin(x * .011 + t * .001 + offset * 2) * amp * .35;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(w, yBase - 220);
      ctx.lineTo(0, yBase - 220);
      ctx.closePath();
      ctx.fill();
    }

    function frame() {
      t += 16;
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, h);
      sky.addColorStop(0, "#05060f");
      sky.addColorStop(.6, "#0b0e24");
      sky.addColorStop(1, "#140f2e");
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, h);

      ctx.globalCompositeOperation = "lighter";
      aurora(0, "#4cc9f022", 60, h * .28);
      aurora(2.1, "#a78bfa1c", 80, h * .22);
      aurora(4.2, "#34d39914", 50, h * .34);

      for (const s of stars) {
        const a = .35 + Math.sin(t * .002 + s.p) * .35;
        ctx.fillStyle = `rgba(220,235,255,${a})`;
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, 7); ctx.fill();
      }
      for (const f of flakes) {
        f.y += f.vy; f.x += f.vx + Math.sin((t + f.y * 20) * .001) * .2;
        if (f.y > h + 12 || f.y < -12) Object.assign(f, newFlake());
        ctx.fillStyle = f.ember ? "rgba(255,160,80,.75)" : "rgba(220,245,255,.7)";
        ctx.beginPath(); ctx.arc(f.x, f.y, f.r, 0, 7); ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
      if (!reduce) raf = requestAnimationFrame(frame);
    }

    resize();
    frame();
    addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none fixed inset-0 -z-10 h-full w-full" />;
}
