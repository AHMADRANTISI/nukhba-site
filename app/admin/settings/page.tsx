import { db, fmtDate, settings } from "@/lib/core";
import { activateSeason, createSeason, savePaymentMethod, saveSettings } from "../actions";

export default async function AdminSettings() {
  const [seasons, methods, s] = await Promise.all([
    db.season.findMany({ orderBy: { startsAt: "desc" }, include: { _count: { select: { bookings: true } } } }),
    db.paymentMethod.findMany({ orderBy: { sort: "asc" } }),
    settings(),
  ]);
  return (
    <div className="space-y-8">
      <section className="shard p-6">
        <h2 className="font-display text-2xl">المواسم</h2>
        <p className="mt-1 text-sm text-mist">الموسم النشط هو الذي تُحسب عليه المقاعد. عند تفعيل موسم جديد تعود مقاعد كل الحرّاس فارغة.</p>
        <ul className="mt-4 space-y-2">
          {seasons.map((x) => (
            <li key={x.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3">
              <b className="font-display">{x.name}</b>
              <span className="text-sm text-mist">{fmtDate(x.startsAt)} ← {fmtDate(x.endsAt)} · {x._count.bookings} حجز</span>
              {x.active ? <span className="ms-auto rounded-full bg-gold/20 px-3 py-1 text-xs text-gold">نشط</span> : (
                <form action={activateSeason} className="ms-auto"><input type="hidden" name="id" value={x.id} /><button className="btn-ghost !py-1 text-sm">تفعيل</button></form>
              )}
            </li>
          ))}
        </ul>
        <form action={createSeason} className="mt-5 grid gap-3 sm:grid-cols-4">
          <input name="name" placeholder="اسم الموسم (مثال: C9S27)" required className="field" />
          <input name="startsAt" type="date" required className="field" />
          <input name="endsAt" type="date" required className="field" />
          <button className="btn-summit">إضافة موسم</button>
        </form>
      </section>

      <section className="shard p-6">
        <h2 className="font-display text-2xl">طرق الدفع</h2>
        <div className="mt-4 space-y-3">
          {[...methods, null].map((m, i) => (
            <form key={m?.id ?? "new"} action={savePaymentMethod} className="grid gap-3 rounded-xl border border-white/10 p-3 sm:grid-cols-[1fr_2fr_70px_auto_auto]">
              <input type="hidden" name="id" value={m?.id ?? ""} />
              <input name="name" defaultValue={m?.name} placeholder="اسم الطريقة" className="field" />
              <textarea name="details" defaultValue={m?.details} placeholder="التفاصيل (رقم الحساب / المحفظة…)" rows={1} className="field" />
              <input name="sort" type="number" defaultValue={m?.sort ?? i} className="field" />
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked={m?.active ?? true} className="accent-[#ffcf6b]" />مفعّل</label>
              <div className="flex gap-2">
                <button className="btn-ghost !px-4 !py-2 text-sm">{m ? "حفظ" : "إضافة"}</button>
                {m && <button name="delete" value="1" className="text-sm text-rose">حذف</button>}
              </div>
            </form>
          ))}
        </div>
      </section>

      <section className="shard p-6">
        <h2 className="font-display text-2xl">التواصل</h2>
        <form action={saveSettings} className="mt-4 grid gap-3 sm:grid-cols-3">
          <input name="whatsapp" defaultValue={s.whatsapp} placeholder="رقم واتساب مع رمز الدولة" dir="ltr" className="field" />
          <input name="telegram" defaultValue={s.telegram} placeholder="@معرف تيليجرام" dir="ltr" className="field" />
          <button className="btn-summit">حفظ</button>
        </form>
      </section>
    </div>
  );
}
