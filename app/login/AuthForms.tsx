"use client";
import { useActionState, useState } from "react";
import { login, register, registerPro } from "@/app/actions";

type Side = "customer" | "pro";

export default function AuthForms({ next, side: initialSide }: { next: string; side: Side }) {
  const [side, setSide] = useState<Side>(initialSide);
  const [tab, setTab] = useState<"in" | "up">("in");
  const [show, setShow] = useState(false);
  const [inState, inAction, inPending] = useActionState(login, null);
  const [upState, upAction, upPending] = useActionState(register, null);
  const [proState, proAction, proPending] = useActionState(registerPro, null);
  const pro = side === "pro";
  const signup = tab === "up";
  const err = !signup ? inState?.error : pro ? proState?.error : upState?.error;
  const action = !signup ? inAction : pro ? proAction : upAction;

  return (
    <>
      {/* Who is signing in: the customer who books, or the player who provides the service */}
      <div className="grid grid-cols-2 gap-2">
        {([["customer", "عميل", "أريد حجز لاعب"], ["pro", "لاعب محترف", "أقدّم خدمة الرفع"]] as const).map(([k, t, sub]) => (
          <button key={k} type="button" onClick={() => { setSide(k); setTab("in"); }} aria-pressed={side === k}
            className={`rounded-xl border px-3 py-3 text-center transition ${side === k ? "border-gold bg-gold/10" : "border-white/10 hover:border-white/30"}`}>
            <span className={`block font-display text-lg ${side === k ? "text-gold" : "text-white"}`}>{t}</span>
            <span className="block text-xs text-mist">{sub}</span>
          </button>
        ))}
      </div>

      <div className="mt-5 grid grid-cols-2 rounded-xl bg-night/60 p-1 font-display">
        {([["in", "دخول"], ["up", pro ? "طلب انضمام" : "حساب جديد"]] as const).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`rounded-lg py-2 transition ${tab === k ? "bg-gold text-night" : "text-mist"}`}>{t}</button>
        ))}
      </div>

      {pro && signup && (
        <p className="mt-4 rounded-xl border border-gold/30 bg-gold/5 p-3 text-sm leading-7 text-mist">
          بعد التسجيل تعبّئ بطاقتك (جهازك، خبرتك، إنجازاتك، أسعارك). لا تظهر للعملاء إلا بعد أن تتحقق الإدارة من هويتك وسجلّك النظيف.
        </p>
      )}

      <form key={`${side}-${tab}`} action={action} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        <input type="hidden" name="as" value={side} />
        {signup && (
          <>
            <div><label className="label" htmlFor="name">{pro ? "اسمك الحقيقي" : "الاسم"}</label><input id="name" name="name" required className="field" /></div>
            {pro && <div><label className="label" htmlFor="gameName">اسمك في اللعبة</label><input id="gameName" name="gameName" required dir="ltr" className="field" /></div>}
            <div><label className="label" htmlFor="phone">رقم واتساب</label><input id="phone" name="phone" required dir="ltr" className="field" /></div>
          </>
        )}
        <div><label className="label" htmlFor="email">البريد الإلكتروني</label><input id="email" name="email" type="email" required dir="ltr" className="field" /></div>
        <div><label className="label" htmlFor="password">كلمة المرور</label>
          <div className="relative">
            <input id="password" name="password" type={show ? "text" : "password"} required dir="ltr" className="field" style={{ paddingRight: "3rem" }} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "إخفاء كلمة المرور" : "عرض كلمة المرور"} aria-pressed={show}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mist transition hover:text-gold">
              <EyeIcon off={show} />
            </button>
          </div>
        </div>
        {err && <p role="alert" className="rounded-lg bg-rose/10 p-3 text-sm text-rose">{err}</p>}
        <button disabled={inPending || upPending || proPending} className="btn-summit w-full disabled:opacity-50">
          {!signup ? (pro ? "دخول اللاعبين" : "دخول العملاء") : pro ? "إرسال طلب الانضمام" : "إنشاء الحساب"}
        </button>
      </form>
    </>
  );
}

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
      {off && <path d="M4 4l16 16" />}
    </svg>
  );
}
