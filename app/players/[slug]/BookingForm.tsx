"use client";
import { useActionState, useState } from "react";
import { book } from "@/app/actions";
import { QrGlyph } from "@/components/QrGlyph";

type Svc = { key: string; name: string; price: number; days: number };

export default function BookingForm({ slug, server, services }: { slug: string; server: string; services: Svc[] }) {
  const [state, action, pending] = useActionState(book, null);
  const [svc, setSvc] = useState(services[0]?.key);
  const chosen = services.find((s) => s.key === svc);

  return (
    <form action={action} className="mt-5 space-y-4">
      <input type="hidden" name="slug" value={slug} />
      <fieldset>
        <legend className="label">نوع الرانك</legend>
        <div className="grid gap-2">
          {services.map((s) => (
            <label key={s.key} className={`flex cursor-pointer items-center justify-between rounded-xl border px-4 py-3 transition ${svc === s.key ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
              <input type="radio" name="service" value={s.key} checked={svc === s.key} onChange={() => setSvc(s.key)} className="sr-only" />
              <span className="font-display">{s.name}</span>
              <span className="text-sm text-mist"><b className="font-display text-lg text-gold">${s.price}</b> · {s.days} يوم</span>
            </label>
          ))}
        </div>
      </fieldset>


      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="gameName">الاسم في اللعبة</label><input id="gameName" name="gameName" required className="field" /></div>
        <div><label className="label" htmlFor="gameId">ID الحساب</label><input id="gameId" name="gameId" required inputMode="numeric" dir="ltr" className="field" /></div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div><label className="label" htmlFor="server">السيرفر</label><input id="server" name="server" defaultValue={server} required className="field" /></div>
        <div><label className="label" htmlFor="contact">واتساب / تيليجرام</label><input id="contact" name="contact" required dir="ltr" className="field" /></div>
      </div>

      <div className="flex gap-3 rounded-xl border border-gold/30 bg-gold/5 p-4">
        <QrGlyph />
        <div className="text-sm leading-7">
          <p className="font-display text-white">الدخول عبر رمز QR فقط</p>
          <p className="text-mist">لا نطلب كلمة مرورك أبداً. عند بدء الصعود يرسل لك اللاعب رمز QR على واتساب، تمسحه من داخل اللعبة فيدخل حسابك.</p>
        </div>
      </div>

      <div><label className="label" htmlFor="notes">ملاحظات (اختياري)</label><textarea id="notes" name="notes" rows={2} className="field" /></div>

      <label className="flex gap-2 text-sm text-mist">
        <input type="checkbox" name="agree" className="mt-1 accent-[#ffcf6b]" />
        أوافق على أن المقعد يُحجز 24 ساعة بانتظار إثبات الدفع، وأن اللاعب ملتزم بميثاق اللعب النظيف.
      </label>

      {state?.error && <p role="alert" className="rounded-lg bg-rose/10 p-3 text-sm text-rose">{state.error}</p>}

      <button disabled={pending || !chosen} className="btn-summit w-full disabled:opacity-50">
        {pending ? "جارٍ الحجز…" : `احجز المقعد — $${chosen?.price ?? 0}`}
      </button>
    </form>
  );
}
