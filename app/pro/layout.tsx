import Link from "next/link";
import { requirePlayer } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProLayout({ children }: { children: React.ReactNode }) {
  const { player } = await requirePlayer();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">لوحة اللاعب</h1>
        <span className="font-display text-gold" dir="ltr">{player.name}</span>
        <nav className="ms-auto flex flex-wrap gap-2 font-display">
          {[["/pro", "حجوزاتي"], ["/pro/profile", "بطاقتي"]].map(([h, t]) => (
            <Link key={h} href={h} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:border-gold hover:text-gold">{t}</Link>
          ))}
        </nav>
      </div>
      {children}
    </div>
  );
}
