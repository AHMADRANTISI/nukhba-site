"use client";
import { useActionState, useState } from "react";
import { book } from "@/app/actions";
import { LOGIN_TYPES } from "@/lib/core-client";

type Svc = { key: string; name: string; price: number; days: number };

export default function BookingForm({ slug, server, services }: { slug: string; server: string; services: Svc[] }) {
  const [state, action, pending] = useActionState(book, null);
  const [svc, setSvc] = useState(services[0]?.key);
  const [mode, setMode] = useState<"DUO" | "LOGIN">("DUO");
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

      <fieldset>
        <legend className="label">طريقة الصعود</legend>
        <div className="grid grid-cols-2 gap-2">
          {([["DUO", "ألعب معه", "الأكثر أماناً"], ["LOGIN", "يدخل حسابي", "أسرع"]] as const).map(([k, t, d]) => (
            <label key={k} className={`cursor-pointer rounded-xl border p-3 text-center transition ${mode === k ? "border-ice bg-ice/10" : "border-white/10"}`}>
              <input type="radio" name="mode" value={k} checked={mode === k} onChange={() => setMode(k)} className="sr-only" />
              <div className="font-display">{t}</div><div className="text-xs text-mist">{d}</div>
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

      {mode === "LOGIN" && (
        <div className="space-y-3 rounded-xl border border-ice/30 bg-ice/5 p-4">
          <p className="text-xs leading-6 text-ice">🔒 تُشفَّر هذه البيانات فوراً ولا يراها إلا الإدارة، وتُحذف نهائياً عند الإنجاز أو الإلغاء.</p>
          <select name="loginType" className="field" defaultValue="">
            <option value="" disabled>طريقة الدخول</option>
            {LOGIN_TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
          <input name="loginUser" placeholder="البريد / رقم الهاتف / اسم المستخدم" dir="ltr" className="field" autoComplete="off" />
          <input name="loginPass" type="password" placeholder="كلمة المرور" dir="ltr" className="field" autoComplete="new-password" />
        </div>
      )}

      <div><label className="label" htmlFor="notes">ملاحظات (اختياري)</label><textarea id="notes" name="notes" rows={2} className="field" /></div>

      <label className="flex gap-2 text-sm text-mist">
        <input type="checkbox" name="agree" className="mt-1 accent-[#ffcf6b]" />
        أوافق على أن المقعد يُحجز 24 ساعة بانتظار إثبات الدفع، وأن الحارس ملتزم بميثاق اللعب النظيف.
      </label>

      {state?.error && <p role="alert" className="rounded-lg bg-rose/10 p-3 text-sm text-rose">{state.error}</p>}

      <button disabled={pending || !chosen} className="btn-summit w-full disabled:opacity-50">
        {pending ? "جارٍ الحجز…" : `احجز المقعد — $${chosen?.price ?? 0}`}
      </button>
    </form>
  );
}
