import Link from "next/link";
import { requireAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <nav className="mb-8 flex flex-wrap gap-2 font-display">
        {[["/admin", "الحجوزات"], ["/admin/players", "الحرّاس"], ["/admin/reviews", "التقييمات"], ["/admin/settings", "المواسم والدفع"]].map(([h, t]) => (
          <Link key={h} href={h} className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 hover:border-gold hover:text-gold">{t}</Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
