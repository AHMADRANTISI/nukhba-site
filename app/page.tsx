import Link from "next/link";
import { activeSeason, db, SERVICE_KEYS, SERVICES, takenSlots } from "@/lib/core";
import { Crystal, Range } from "@/components/Art";
import PlayerCard, { playerSelect, withCompleted } from "@/components/PlayerCard";

export const dynamic = "force-dynamic";

const TITLE = "اصعد إلى القمّة";

export default async function Home() {
  const season = await activeSeason();
  const [players, taken] = await Promise.all([
    db.player.findMany({ where: { active: true }, orderBy: { sort: "asc" }, take: 4, select: playerSelect }),
    takenSlots(season?.id),
  ]);
  const all = await db.player.findMany({ where: { active: true }, select: { id: true, slotsPerSeason: true } });
  const totalSlots = all.reduce((n, p) => n + p.slotsPerSeason, 0);
  const used = all.reduce((n, p) => n + Math.min(p.slotsPerSeason, taken.get(p.id) ?? 0), 0);

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100dvh-60px)] items-start overflow-hidden">
        <Range />
        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-[12vh] text-center">
          <p data-reveal className="mx-auto inline-flex items-center gap-2 rounded-full border border-ice/30 bg-ice/5 px-4 py-1 text-xs text-ice">
            <span className="h-1.5 w-1.5 rounded-full bg-ice beacon" />
            {season ? `${season.name} مفتوح للحجز — ${totalSlots - used} مقعد متبقٍ` : "الموسم القادم قريباً"}
          </p>
          <h1 className="rise mt-6 font-display text-6xl leading-[1.15] sm:text-8xl" aria-label={TITLE}>
            {TITLE.split(" ").map((w, i) => (
              <span key={i} style={{ ["--i" as string]: i * 3 }} className={`mx-[.12em] ${i === 2 ? "text-aurora" : ""}`}>{w}</span>
            ))}
          </h1>
          <p data-reveal style={{ ["--d" as string]: ".6s" }} className="mx-auto mt-6 max-w-xl text-lg leading-8 text-mist">
            لا نبيع «رفع رانك» — نحن نُنظّم <b className="text-white">حرّاس القمة</b>: لاعبون محترفون موثّقون، سجلّهم نظيف،
            لا يلمسون الغش. كل حارس يقبل <b className="text-gold">8 حجوزات فقط</b> في الموسم.
          </p>
          <div data-reveal style={{ ["--d" as string]: ".8s" }} className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/players" className="btn-summit">اختر حارسك</Link>
            <Link href="#trust" className="btn-ghost">لماذا حسابك بأمان؟</Link>
          </div>
        </div>
      </section>

      {/* ── THREE ROUTES ─────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 py-24">
        <SectionHead kicker="ثلاث طرق" title="أيّ قمّة تريد؟" />
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {SERVICE_KEYS.map((k, i) => (
            <div key={k} data-reveal style={{ ["--d" as string]: `${i * 0.15}s` }} className="shard p-7 text-center">
              <div className="flex justify-center"><Crystal kind={k} size={150} /></div>
              <h3 className="mt-2 font-display text-3xl">{SERVICES[k].name}</h3>
              <p className="mt-3 leading-7 text-mist">{SERVICES[k].blurb}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── GUARDIANS ────────────────────────────────────── */}
      <section className="relative mx-auto max-w-6xl px-4 py-16">
        <SectionHead kicker="حرّاس القمة" title="لاعبون نعرفهم بالاسم" sub="كل حلقة حول الحارس = 8 مقاعد للموسم. الذهبي محجوز، المضيء متاح." />
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {players.map((p, i) => <PlayerCard key={p.id} p={withCompleted(p)} taken={taken.get(p.id) ?? 0} delay={i * 0.1} />)}
        </div>
        <div className="mt-10 text-center"><Link href="/players" className="btn-ghost">كل الحرّاس</Link></div>
      </section>

      {/* ── TRUST ────────────────────────────────────────── */}
      <section id="trust" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-24">
        <SectionHead kicker="ميثاق اللعب النظيف" title="حسابك أمانة، لا تجربة" />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["هوية موثّقة", "نعرف كل حارس باسمه الحقيقي ووسيلة تواصله قبل نشر ملفه."],
            ["سجل بلا حظر", "نفحص حساباته: لا حظر، لا إنذارات، لا تاريخ غش."],
            ["لعب مُراجَع", "نشاهد تسجيلات لعبه الكاملة قبل القبول — المهارة حقيقية."],
            ["تعهّد موقّع", "يوقّع الحارس ميثاقاً: لا برامج، لا هكات، لا مشاركة الحساب لأحد."],
          ].map(([t, d], i) => (
            <div key={t} data-reveal style={{ ["--d" as string]: `${i * 0.12}s` }} className="shard p-6">
              <div className="font-display text-5xl text-gold/30">0{i + 1}</div>
              <h3 className="mt-2 font-display text-xl text-white">{t}</h3>
              <p className="mt-2 text-sm leading-7 text-mist">{d}</p>
            </div>
          ))}
        </div>
        <div data-reveal className="shard mt-6 grid gap-6 p-7 md:grid-cols-3">
          {[
            ["بيانات مشفّرة", "بيانات دخول حسابك تُخزَّن مشفّرة (AES-256) ولا يراها إلا الإدارة."],
            ["تُحذف تلقائياً", "بمجرد وصولك للقمة أو إلغاء الحجز تُمسح بياناتك نهائياً."],
            ["أو العب معه", "لا تريد مشاركة حسابك؟ اختر «اللعب مع الحارس» وتصعد بيدك."],
          ].map(([t, d]) => (
            <div key={t}><h4 className="font-display text-lg text-ice">{t}</h4><p className="mt-1 text-sm leading-7 text-mist">{d}</p></div>
          ))}
        </div>
      </section>

      {/* ── HOW ──────────────────────────────────────────── */}
      <section id="how" className="relative mx-auto max-w-6xl scroll-mt-20 px-4 py-20">
        <SectionHead kicker="مسار الصعود" title="أربعة معسكرات حتى القمّة" />
        <div className="relative mt-16">
          <svg data-reveal aria-hidden viewBox="0 0 1000 120" preserveAspectRatio="none" className="draw absolute inset-x-0 top-6 hidden h-24 w-full md:block">
            <path d="M980 100 C 820 100, 760 20, 640 40 S 420 110, 330 60 S 120 10, 20 20" fill="none" stroke="#ffcf6b" strokeWidth="2" strokeDasharray="6 8" />
          </svg>
          <ol className="relative grid gap-6 md:grid-cols-4">
            {[
              ["المعسكر 1", "اختر حارسك", "قارن الملفات واللقطات والأسعار واختر المقعد."],
              ["المعسكر 2", "احجز وادفع", "عبّئ بيانات الحساب وارفع إثبات الدفع."],
              ["المعسكر 3", "الصعود", "تأكيد الإدارة ثم يبدأ الحارس — تتابع التقدم لحظة بلحظة."],
              ["القمّة", "كونكر", "تستلم حسابك وتُمسح بياناتك من النظام."],
            ].map(([c, t, d], i) => (
              <li key={c} data-reveal style={{ ["--d" as string]: `${i * 0.2}s` }} className="text-center">
                <div className={`mx-auto grid h-20 w-20 rotate-45 place-items-center border ${i === 3 ? "border-gold bg-gold/15 shadow-[0_0_30px_#ffcf6b66]" : "border-ice/40 bg-night"}`}>
                  <span className="-rotate-45 font-display text-2xl text-white">{i === 3 ? "★" : i + 1}</span>
                </div>
                <p className="mt-6 text-xs text-ice">{c}</p>
                <h3 className="font-display text-2xl">{t}</h3>
                <p className="mt-2 text-sm leading-7 text-mist">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────── */}
      <section id="faq" className="relative mx-auto max-w-3xl scroll-mt-20 px-4 py-20">
        <SectionHead kicker="أسئلة" title="قبل أن تبدأ الصعود" />
        <div className="mt-10 space-y-3">
          {[
            ["لماذا 8 حجوزات فقط لكل حارس؟", "حتى يعطي الحارس كل حساب وقته الحقيقي ويبقى الأداء ثابتاً. عندما تمتلئ الحلقة يُغلق الحجز حتى الموسم القادم."],
            ["هل يُحجز المقعد قبل الدفع؟", "نعم، يُحجز لك المقعد 24 ساعة لترفع إثبات الدفع، بعدها يعود متاحاً لغيرك."],
            ["ماذا لو حدثت مشكلة في حسابي؟", "كل حارس موقّع على ميثاق اللعب النظيف ومسؤول أمام الإدارة. أي مخالفة تعني إيقافه نهائياً ومعالجة حقك."],
            ["هل يمكنني اللعب مع الحارس بدل تسليم الحساب؟", "نعم، اختر وضع «اللعب مع الحارس» أثناء الحجز."],
            ["ملاحظة مهمّة", "مشاركة الحساب قد تخالف شروط اللعبة. خيار «اللعب مع الحارس» هو الأكثر أماناً لحسابك."],
          ].map(([q, a]) => (
            <details key={q} data-reveal className="shard group p-5">
              <summary className="flex items-center justify-between gap-4 font-display text-lg">
                {q}<span className="chev text-2xl text-gold transition">+</span>
              </summary>
              <p className="mt-3 leading-8 text-mist">{a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div data-reveal className="text-center">
      <p className="font-display text-sm tracking-[.3em] text-ice">{kicker}</p>
      <h2 className="mt-2 font-display text-4xl sm:text-5xl">{title}</h2>
      {sub && <p className="mx-auto mt-3 max-w-lg text-mist">{sub}</p>}
    </div>
  );
}
