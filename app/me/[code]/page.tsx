import { notFound } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db, fmtDate, HOLD_MS, MODES, money, SERVICES, settings, type ServiceKey } from "@/lib/core";
import { StatusPill } from "@/components/StatusPill";
import { cancelMyBooking } from "@/app/actions";
import ProofForm from "./ProofForm";
import ReviewForm from "./ReviewForm";
import { QrGlyph } from "@/components/QrGlyph";

export const dynamic = "force-dynamic";

export default async function BookingPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const user = await requireUser(`/me/${code}`);
  const b = await db.booking.findUnique({
    where: { code },
    include: { player: true, season: true, review: true, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!b || b.userId !== user.id) notFound();
  const [methods, s] = await Promise.all([db.paymentMethod.findMany({ where: { active: true }, orderBy: { sort: "asc" } }), settings()]);
  const expired = b.status === "PENDING_PAYMENT" && Date.now() - b.createdAt.getTime() > HOLD_MS;
  const progress = b.status === "COMPLETED" ? 100 : b.progress;

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <Link href="/me" className="text-sm text-mist hover:text-white">→ حجوزاتي</Link>
      <div data-reveal className="shard mt-4 p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="font-display text-3xl" dir="ltr">{b.code}</h1>
          <StatusPill status={b.status} />
          <span className="ms-auto font-display text-2xl text-gold">{money(b.price)}</span>
        </div>
        <p className="mt-2 text-mist">
          {SERVICES[b.service as ServiceKey].name} مع اللاعب <Link href={`/players/${b.player.slug}`} className="text-white underline" dir="ltr">{b.player.name}</Link>
          {" · "}{b.season.name} · {MODES[b.mode] ?? b.mode}
        </p>

        {/* climb meter: a mountain whose summit lights when you arrive */}
        <div className="mt-8">
          <svg viewBox="0 0 600 140" className="w-full" aria-label={`التقدّم ${progress}%`}>
            <defs>
              <linearGradient id="climb" x1="0" x2="1"><stop offset="0" stopColor="#4cc9f0" /><stop offset=".6" stopColor="#a78bfa" /><stop offset="1" stopColor="#ffcf6b" /></linearGradient>
              <clipPath id="clip"><rect x={600 - progress * 6} y="0" width={progress * 6} height="140" /></clipPath>
            </defs>
            <path d="M600 130 L520 100 L470 110 L380 60 L320 80 L240 30 L180 55 L120 10 L60 60 L0 130Z" fill="#ffffff0d" />
            <path d="M600 130 L520 100 L470 110 L380 60 L320 80 L240 30 L180 55 L120 10 L60 60 L0 130Z" fill="url(#climb)" opacity=".85" clipPath="url(#clip)" />
            <circle cx="120" cy="10" r="6" fill={progress === 100 ? "#fff6d6" : "#ffffff40"} className={progress === 100 ? "beacon" : ""} />
          </svg>
          <p className="mt-2 text-center font-display text-xl">{progress}% من الطريق إلى القمّة</p>
        </div>
        {b.adminNote && <p className="mt-4 rounded-lg bg-ice/10 p-3 text-sm text-ice">ملاحظة الإدارة: {b.adminNote}</p>}
      </div>

      {(b.status === "CONFIRMED" || b.status === "IN_PROGRESS") && b.mode === "QR" && (
        <div data-reveal className="shard mt-6 flex items-center gap-4 border-gold/30 p-6">
          <QrGlyph size={56} />
          <div>
            <h2 className="font-display text-xl">الدخول عبر رمز QR</h2>
            <p className="mt-1 text-sm leading-7 text-mist">
              سيرسل لك اللاعب رمز QR على واتساب ({b.contact}). امسحه من داخل اللعبة ليدخل حسابك — لا تشارك كلمة مرورك مع أحد، ولا حتى معنا.
            </p>
          </div>
        </div>
      )}
      {(b.status === "PENDING_PAYMENT" || b.status === "PAYMENT_REVIEW") && !expired && (
        <div data-reveal className="shard mt-6 p-6">
          <h2 className="font-display text-2xl">الدفع</h2>
          <p className="mt-1 text-sm text-mist">حوّل <b className="text-gold">{money(b.price)}</b> عبر إحدى الطرق التالية ثم ارفع صورة الإثبات. المقعد محجوز لك حتى {fmtDate(new Date(b.createdAt.getTime() + HOLD_MS))}.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {methods.map((m) => (
              <div key={m.id} className="rounded-xl border border-white/10 bg-night/40 p-4">
                <b className="font-display">{m.name}</b>
                <p className="mt-1 whitespace-pre-line break-all text-sm text-mist" dir="auto">{m.details}</p>
              </div>
            ))}
          </div>
          <ProofForm code={b.code} hasProof={!!b.proofFile} />
          {s.whatsapp && (
            <a className="mt-4 inline-block text-sm text-ice" href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(`حجز ${b.code}`)}`} target="_blank" rel="noopener noreferrer">
              تواصل معنا على واتساب ↗
            </a>
          )}
          {b.status === "PENDING_PAYMENT" && (
            <form action={cancelMyBooking} className="mt-4">
              <input type="hidden" name="code" value={b.code} />
              <button className="text-sm text-rose/80 hover:text-rose">إلغاء الحجز</button>
            </form>
          )}
        </div>
      )}
      {b.status === "COMPLETED" && (
        <div data-reveal className="shard mt-6 border-gold/30 p-6">
          <h2 className="font-display text-2xl">{b.review ? "تقييمك للاعب" : "وصلت القمّة — قيّم لاعبك"}</h2>
          <p className="mt-1 text-sm text-mist">تقييمك يظهر على ملف اللاعب ويساعد غيرك على الاختيار.</p>
          <ReviewForm code={b.code} player={b.player.name}
            initial={b.review ? { rating: b.review.rating, text: b.review.text, hidden: b.review.hidden } : undefined} />
        </div>
      )}
      {expired &&<p className="shard mt-6 p-6 text-rose">انتهت مهلة الدفع (24 ساعة) وعاد المقعد متاحاً. يمكنك الحجز من جديد إن بقيت مقاعد.</p>}

      <div data-reveal className="shard mt-6 p-6">
        <h2 className="font-display text-2xl">سجل الرحلة</h2>
        <ol className="mt-4 space-y-4 border-r border-white/10 pr-5">
          {b.events.map((e) => (
            <li key={e.id} className="relative">
              <span className="absolute -right-[25px] top-1.5 h-2.5 w-2.5 rotate-45 bg-gold" />
              <p>{e.text}</p>
              <p className="text-xs text-mist/60">{e.createdAt.toLocaleString("ar-EG")}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
