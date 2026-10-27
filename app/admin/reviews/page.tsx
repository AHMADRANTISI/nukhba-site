import Link from "next/link";
import { db, fmtDate, SERVICES, type ServiceKey } from "@/lib/core";
import { Stars } from "@/components/Stars";
import { toggleReview } from "../actions";

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ hidden?: string }> }) {
  const { hidden } = await searchParams;
  const reviews = await db.review.findMany({
    where: hidden ? { hidden: true } : {}, orderBy: { createdAt: "desc" }, take: 200,
    include: { user: { select: { name: true, email: true } }, player: { select: { name: true, slug: true } }, booking: { select: { id: true, code: true, service: true } } },
  });
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">التقييمات</h1>
        <div className="ms-auto flex gap-2 text-sm">
          <Link href="/admin/reviews" className={`rounded-full px-3 py-1 ${!hidden ? "bg-gold text-night" : "bg-white/5"}`}>الكل</Link>
          <Link href="/admin/reviews?hidden=1" className={`rounded-full px-3 py-1 ${hidden ? "bg-gold text-night" : "bg-white/5"}`}>المخفية</Link>
        </div>
      </div>
      <ul className="mt-6 space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className={`shard p-5 ${r.hidden ? "opacity-60" : ""}`}>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <Stars value={r.rating} size={15} />
              <b>{r.user.name}</b><span className="text-mist" dir="ltr">{r.user.email}</span>
              <span className="text-mist">← <Link href={`/players/${r.player.slug}`} className="text-ice" dir="ltr">{r.player.name}</Link></span>
              <Link href={`/admin/bookings/${r.booking.id}`} className="text-ice" dir="ltr">{r.booking.code}</Link>
              <span className="text-mist">{SERVICES[r.booking.service as ServiceKey].short} · {fmtDate(r.createdAt)}</span>
              <form action={toggleReview} className="ms-auto">
                <input type="hidden" name="id" value={r.id} />
                <button className={r.hidden ? "btn-ghost !px-4 !py-1 text-sm" : "text-sm text-rose hover:underline"}>{r.hidden ? "إظهار" : "إخفاء"}</button>
              </form>
            </div>
            {r.text && <p className="mt-2 whitespace-pre-line text-mist">{r.text}</p>}
          </li>
        ))}
      </ul>
      {!reviews.length && <p className="mt-10 text-center text-mist">لا توجد تقييمات.</p>}
    </>
  );
}
