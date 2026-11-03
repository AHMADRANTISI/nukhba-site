import Link from "next/link";
import { requirePlayer } from "@/lib/auth";
import { activeSeason, db, fmtDate, missingCardFields, money, SERVICES, slotWhere, trustScore, type ServiceKey } from "@/lib/core";
import { StatusPill } from "@/components/StatusPill";
import { SigilRing } from "@/components/Art";
import { updateMyBooking } from "./actions";

export default async function ProHome() {
  const { player } = await requirePlayer();
  const season = await activeSeason();
  const [bookings, used, services] = await Promise.all([
    db.booking.findMany({
      where: { playerId: player.id, status: { in: ["CONFIRMED", "IN_PROGRESS", "COMPLETED"] } },
      orderBy: [{ status: "asc" }, { createdAt: "desc" }],
      include: { season: { select: { name: true } } },
    }),
    season ? db.booking.count({ where: slotWhere(player.id, season.id) }) : 0,
    db.playerService.count({ where: { playerId: player.id, enabled: true } }),
  ]);
  const missing = missingCardFields(player, services);
  const open = bookings.filter((b) => b.status !== "COMPLETED");
  const done = bookings.filter((b) => b.status === "COMPLETED");

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-[1fr_auto]">
        <div className="shard p-6">
          <h2 className="font-display text-xl">حالة بطاقتك</h2>
          {player.active ? (
            <p className="mt-2 text-gold">✓ بطاقتك منشورة ويراها العملاء.</p>
          ) : missing.length ? (
            <div className="mt-2 text-sm leading-7 text-mist">
              <p>عبّئ بطاقتك حتى تراجعها الإدارة. ناقص:</p>
              <p className="text-rose">{missing.join(" · ")}</p>
              <Link href="/pro/profile" className="btn-summit mt-3">عبّئ بطاقتك</Link>
            </div>
          ) : (
            <p className="mt-2 text-sm leading-7 text-mist">
              بطاقتك مكتملة — بانتظار تحقق الإدارة ({trustScore(player)}/4). ستتواصل معك الإدارة على واتساب للتحقق من هويتك وتسجيلات لعبك.
            </p>
          )}
        </div>
        <div className="shard flex items-center gap-4 p-6">
          <SigilRing total={player.slotsPerSeason} taken={used} size={86} />
          <div className="text-sm text-mist">
            <div className="font-display text-white">{season?.name ?? "لا يوجد موسم نشط"}</div>
            {used} من {player.slotsPerSeason} مقاعد محجوزة
          </div>
        </div>
      </div>

      <section>
        <h2 className="font-display text-2xl">حجوزات بانتظارك</h2>
        <p className="mt-1 text-sm text-mist">تظهر هنا الحجوزات بعد أن تؤكد الإدارة الدفع. أرسل رمز QR للعميل على واتساب عند البدء.</p>
        <div className="mt-4 space-y-4">
          {open.map((b) => (
            <form key={`${b.id}-${b.updatedAt.getTime()}`} action={updateMyBooking} className="shard grid gap-4 p-5 lg:grid-cols-[1fr_320px]">
              <input type="hidden" name="id" value={b.id} />
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display text-lg" dir="ltr">{b.code}</span>
                  <StatusPill status={b.status} />
                  <span className="font-display text-gold">{money(b.price)}</span>
                </div>
                <dl className="mt-3 grid grid-cols-[110px_1fr] gap-y-1 text-sm">
                  <dt className="text-mist">الخدمة</dt><dd>{SERVICES[b.service as ServiceKey]?.name}</dd>
                  <dt className="text-mist">الاسم / ID</dt><dd dir="ltr" className="text-right">{b.gameName} — {b.gameId}</dd>
                  <dt className="text-mist">السيرفر</dt><dd>{b.server}</dd>
                  <dt className="text-mist">تواصل العميل</dt><dd dir="ltr" className="text-right">{b.contact}</dd>
                  <dt className="text-mist">ملاحظات</dt><dd>{b.notes || "—"}</dd>
                </dl>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-gold" style={{ width: `${b.progress}%` }} /></div>
              </div>
              <div className="space-y-3">
                <div><label className="label">الحالة</label>
                  <select name="status" defaultValue={b.status} className="field">
                    {b.status === "CONFIRMED" && <option value="CONFIRMED">مؤكد — لم أبدأ بعد</option>}
                    <option value="IN_PROGRESS">قيد الصعود</option>
                    <option value="COMPLETED">وصل القمة ✓</option>
                  </select>
                </div>
                <div><label className="label">التقدّم %</label><input name="progress" type="number" min={0} max={99} defaultValue={b.progress} className="field" /></div>
                <div><label className="label">ملاحظة ظاهرة للعميل</label><input name="note" defaultValue={b.adminNote} placeholder="مثال: ألعب يومياً من 8 مساءً" className="field" /></div>
                <div><label className="label">إضافة حدث للسجل</label><input name="event" placeholder="مثال: وصل إيس دومينيتور" className="field" /></div>
                <button className="btn-summit w-full">حفظ التحديث</button>
              </div>
            </form>
          ))}
          {!open.length && <div className="shard p-8 text-center text-mist">لا توجد حجوزات مؤكدة حالياً.</div>}
        </div>
      </section>

      {!!done.length && (
        <section>
          <h2 className="font-display text-2xl">أنجزتها</h2>
          <div className="mt-4 space-y-2">
            {done.map((b) => (
              <div key={b.id} className="shard flex flex-wrap items-center gap-4 p-4 text-sm">
                <span className="font-display" dir="ltr">{b.code}</span>
                <span className="flex-1 text-mist">{SERVICES[b.service as ServiceKey]?.name} · {b.season.name} · {fmtDate(b.createdAt)}</span>
                <span className="font-display text-gold">{money(b.price)}</span>
                <StatusPill status={b.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
