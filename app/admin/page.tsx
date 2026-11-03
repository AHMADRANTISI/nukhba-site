import Link from "next/link";
import { activeSeason, db, money, SERVICES, STATUS, takenSlots, type ServiceKey } from "@/lib/core";
import { StatusPill } from "@/components/StatusPill";
import { SigilRing } from "@/components/Art";

export default async function AdminBookings({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams;
  const season = await activeSeason();
  const [bookings, players, taken, counts] = await Promise.all([
    db.booking.findMany({
      where: status ? { status } : {}, orderBy: { createdAt: "desc" }, take: 200,
      include: { player: { select: { name: true } }, user: { select: { name: true } } },
    }),
    db.player.findMany({ where: { active: true }, orderBy: { sort: "asc" }, select: { id: true, name: true, slotsPerSeason: true } }),
    takenSlots(season?.id),
    db.booking.groupBy({ by: ["status"], _count: true }),
  ]);
  const count = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <>
      <h1 className="font-display text-3xl">{season ? season.name : "لا يوجد موسم نشط"}</h1>
      <div className="mt-5 flex gap-4 overflow-x-auto pb-2">
        {players.map((p) => (
          <div key={p.id} className="shard shrink-0 p-3 text-center">
            <SigilRing total={p.slotsPerSeason} taken={taken.get(p.id) ?? 0} size={70} />
            <div className="font-display text-sm" dir="ltr">{p.name}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-2 text-sm">
        <Link href="/admin" className={`rounded-full px-3 py-1 ${!status ? "bg-gold text-night" : "bg-white/5"}`}>الكل</Link>
        {Object.entries(STATUS).map(([k, v]) => (
          <Link key={k} href={`/admin?status=${k}`} className={`rounded-full px-3 py-1 ${status === k ? "bg-gold text-night" : "bg-white/5"}`}>
            {v.label} ({count[k] ?? 0})
          </Link>
        ))}
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-right text-mist"><tr>{["الرمز", "العميل", "اللاعب", "الخدمة", "السعر", "الحالة", "التاريخ"].map((h) => <th key={h} className="p-3 font-normal">{h}</th>)}</tr></thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b.id} className="border-t border-white/5 hover:bg-white/5">
                <td className="p-3"><Link href={`/admin/bookings/${b.id}`} className="font-display text-ice" dir="ltr">{b.code}</Link></td>
                <td className="p-3">{b.user.name}</td>
                <td className="p-3" dir="ltr">{b.player.name}</td>
                <td className="p-3">{SERVICES[b.service as ServiceKey].short} · {b.mode === "QR" ? "QR" : b.mode === "DUO" ? "معه" : "دخول"}</td>
                <td className="p-3 text-gold">{money(b.price)}</td>
                <td className="p-3"><StatusPill status={b.status} /></td>
                <td className="p-3 text-mist">{b.createdAt.toLocaleDateString("ar-EG")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!bookings.length && <p className="p-6 text-center text-mist">لا توجد حجوزات.</p>}
      </div>
    </>
  );
}
