"use client";
import { useActionState, useState } from "react";
import { login, register } from "@/app/actions";

export default function AuthForms({ next }: { next: string }) {
  const [tab, setTab] = useState<"in" | "up">("in");
  const [show, setShow] = useState(false);
  const [inState, inAction, inPending] = useActionState(login, null);
  const [upState, upAction, upPending] = useActionState(register, null);
  const err = tab === "in" ? inState?.error : upState?.error;

  return (
    <>
      <div className="grid grid-cols-2 rounded-xl bg-night/60 p-1 font-display">
        {([["in", "دخول"], ["up", "حساب جديد"]] as const).map(([k, t]) => (
          <button key={k} type="button" onClick={() => setTab(k)}
            className={`rounded-lg py-2 transition ${tab === k ? "bg-gold text-night" : "text-mist"}`}>{t}</button>
        ))}
      </div>
      <form action={tab === "in" ? inAction : upAction} className="mt-6 space-y-4">
        <input type="hidden" name="next" value={next} />
        {tab === "up" && (
          <>
            <div><label className="label" htmlFor="name">الاسم</label><input id="name" name="name" required className="field" /></div>
            <div><label className="label" htmlFor="phone">رقم واتساب</label><input id="phone" name="phone" required dir="ltr" className="field" /></div>
          </>
        )}
        <div><label className="label" htmlFor="email">البريد الإلكتروني</label><input id="email" name="email" type="email" required dir="ltr" className="field" /></div>
        <div><label className="label" htmlFor="password">كلمة المرور</label><div className="relative">
            <input id="password" name="password" type={show ? "text" : "password"} required dir="ltr" className="field" style={{ paddingRight: "3rem" }} />
            <button type="button" onClick={() => setShow((v) => !v)} aria-label={show ? "إخفاء كلمة المرور" : "عرض كلمة المرور"} aria-pressed={show}
              className="absolute inset-y-0 right-0 grid w-12 place-items-center text-mist transition hover:text-gold">
              <EyeIcon off={show} />
            </button>
          </div>
        </div>
        {err && <p role="alert" className="rounded-lg bg-rose/10 p-3 text-sm text-rose">{err}</p>}
        <button disabled={inPending || upPending} className="btn-summit w-full disabled:opacity-50">
          {tab === "in" ? "دخول" : "إنشاء الحساب"}
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
