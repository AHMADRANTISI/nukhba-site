import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db, fmtDate, money, SERVICES, type ServiceKey } from "@/lib/core";
import { StatusPill } from "@/components/StatusPill";

export const dynamic = "force-dynamic";

export default async function MyBookings() {
  const user = await requireUser("/me");
  if (user.role === "PLAYER") redirect("/pro");
  const bookings = await db.booking.findMany({
    where: { userId: user.id }, orderBy: { createdAt: "desc" },
    include: { player: { select: { name: true } }, season: { select: { name: true } }, review: { select: { id: true } } },
  });
  return (
    <section className="mx-auto max-w-4xl px-4 py-14">
      <h1 data-reveal className="font-display text-4xl">حجوزاتي</h1>
      <p className="mt-1 text-mist">أهلاً {user.name}</p>
      <div className="mt-8 space-y-3">
        {bookings.map((b) => (
          <Link key={b.id} href={`/me/${b.code}`} data-reveal className="shard flex flex-wrap items-center gap-4 p-5 hover:bg-white/5">
            <div className="font-display text-lg" dir="ltr">{b.code}</div>
            <div className="flex-1 text-sm text-mist">
              {SERVICES[b.service as ServiceKey].name} مع <b className="text-white" dir="ltr">{b.player.name}</b> · {b.season.name} · {fmtDate(b.createdAt)}
            </div>
            <span className="font-display text-gold">{money(b.price)}</span>
            <StatusPill status={b.status} />
            {b.status === "COMPLETED" && !b.review && <span className="rounded-full bg-gold px-3 py-1 text-xs text-night">★ قيّم لاعبك</span>}
          </Link>
        ))}
        {!bookings.length && (
          <div className="shard p-10 text-center">
            <p className="text-mist">لا توجد حجوزات بعد.</p>
            <Link href="/players" className="btn-summit mt-5">اختر لاعبك</Link>
          </div>
        )}
      </div>
    </section>
  );
}
