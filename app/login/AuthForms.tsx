"use client";
import { useActionState, useState } from "react";
import { login, register } from "@/app/actions";

export default function AuthForms({ next }: { next: string }) {
  const [tab, setTab] = useState<"in" | "up">("in");
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
        <div><label className="label" htmlFor="password">كلمة المرور</label><input id="password" name="password" type="password" required dir="ltr" className="field" /></div>
        {err && <p role="alert" className="rounded-lg bg-rose/10 p-3 text-sm text-rose">{err}</p>}
        <button disabled={inPending || upPending} className="btn-summit w-full disabled:opacity-50">
          {tab === "in" ? "دخول" : "إنشاء الحساب"}
        </button>
      </form>
    </>
  );
}
