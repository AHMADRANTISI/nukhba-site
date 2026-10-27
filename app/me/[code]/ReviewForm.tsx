"use client";
import { useActionState, useState } from "react";
import { submitReview } from "@/app/actions";
import { Star } from "@/components/Stars";

const WORDS = ["", "سيئ", "مقبول", "جيد", "ممتاز", "أسطوري"];

export default function ReviewForm({ code, player, initial }: { code: string; player: string; initial?: { rating: number; text: string; hidden: boolean } }) {
  const [state, action, pending] = useActionState(submitReview, null);
  const [rating, setRating] = useState(initial?.rating ?? 0);
  const [hover, setHover] = useState(0);
  const shown = hover || rating;

  return (
    <form action={action} className="mt-4 space-y-4">
      <input type="hidden" name="code" value={code} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex gap-1" dir="ltr" role="radiogroup" aria-label="التقييم" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} نجوم`}
              onClick={() => setRating(n)} onMouseEnter={() => setHover(n)}
              className={`transition duration-200 hover:scale-125 ${n <= shown ? "text-gold drop-shadow-[0_0_8px_#ffcf6b]" : "text-white/20"}`}
              style={{ transitionDelay: `${n * 25}ms` }}>
              <Star size={36} />
            </button>
          ))}
        </div>
        <span className="font-display text-xl text-gold">{WORDS[shown]}</span>
      </div>
      <div>
        <label className="label" htmlFor="text">كيف كانت تجربتك مع <span dir="ltr">{player}</span>؟ (اختياري)</label>
        <textarea id="text" name="text" rows={3} maxLength={800} defaultValue={initial?.text} className="field" placeholder="الالتزام بالوقت، أسلوب اللعب، التواصل…" />
      </div>
      {initial?.hidden && <p className="text-xs text-mist">تقييمك مخفي حالياً من قبل الإدارة.</p>}
      {state?.error && <p role="alert" className="rounded-lg bg-rose/10 p-3 text-sm text-rose">{state.error}</p>}
      {state?.ok && <p role="status" className="rounded-lg bg-gold/10 p-3 text-sm text-gold">شكراً! تم حفظ تقييمك ✦</p>}
      <button disabled={pending || !rating} className="btn-summit disabled:opacity-50">
        {pending ? "جارٍ الحفظ…" : initial ? "تحديث التقييم" : "نشر التقييم"}
      </button>
    </form>
  );
}
