import { notFound } from "next/navigation";
import Link from "next/link";
import { activeSeason, db, fmtDate, money, reviewerName, SERVICES, slotWhere, trustScore, type ServiceKey } from "@/lib/core";
import { getUser } from "@/lib/auth";
import { Avatar, Crystal, SigilRing, TrustSeal } from "@/components/Art";
import BookingForm from "./BookingForm";
import { Stars } from "@/components/Stars";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.player.findUnique({ where: { slug }, select: { name: true, title: true } });
  return p ? { title: `${p.name} — حارس قمّة`, description: p.title } : {};
}

function tiktokId(url: string) {
  return url.match(/\/video\/(\d{8,25})/)?.[1] ?? null;
}

export default async function PlayerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = await db.player.findUnique({
    where: { slug },
    include: { services: { where: { enabled: true } }, _count: { select: { bookings: { where: { status: "COMPLETED" } } } } },
  });
  if (!p || !p.active) notFound();
  const [season, user] = await Promise.all([activeSeason(), getUser()]);
  const taken = season ? await db.booking.count({ where: slotWhere(p.id, season.id) }) : 0;
  const left = Math.max(0, p.slotsPerSeason - taken);
  const completed = p.completedBase + p._count.bookings;
  const reviews = await db.review.findMany({
    where: { playerId: p.id, hidden: false }, orderBy: { createdAt: "desc" }, take: 30,
    include: { user: { select: { name: true } }, booking: { select: { service: true } } },
  });
  const avg = reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
  const dist = [5, 4, 3, 2, 1].map((s) => [s, reviews.filter((r) => r.rating === s).length] as const);
  const clips = p.tiktokVideos.split("\n").map((u) => tiktokId(u.trim())).filter(Boolean).slice(0, 6) as string[];
  const checks: [boolean, string, string][] = [
    [p.idVerified, "هوية موثّقة", "تم التحقق من هويته ووسيلة تواصله"],
    [p.cleanRecord, "سجل نظيف", "لا حظر ولا إنذارات ولا تاريخ غش"],
    [p.gameplayReview, "لعب مُراجَع", "راجعنا تسجيلات لعبه الكاملة"],
    [p.pledgeSigned, "ميثاق موقّع", "تعهّد بعدم استخدام أي برامج أو هكات"],
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <Link href="/players" className="text-sm text-mist hover:text-white">→ كل الحرّاس</Link>

      {/* ── DOSSIER HEADER ── */}
      <section data-reveal className="shard scanline mt-4 overflow-hidden p-6 sm:p-10">
        <div className="pointer-events-none absolute -left-10 -top-10 opacity-40"><Crystal kind="CLASSIC" size={260} /></div>
        <div className="relative flex flex-col gap-8 md:flex-row md:items-center">
          <div className="relative mx-auto md:mx-0">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-gold/40 via-violet/30 to-ice/40 blur-xl" />
            <div className="relative"><Avatar name={p.name} file={p.avatar} size={180} /></div>
            <div className="absolute -bottom-5 -left-5"><TrustSeal score={trustScore(p)} size={64} /></div>
          </div>
          <div className="flex-1 text-center md:text-right">
            <p className="font-display text-sm text-ice">حارس قمّة {p.verifiedAt ? "موثّق" : ""}</p>
            <h1 className="mt-1 font-display text-6xl tracking-wider" dir="ltr">{p.name}</h1>
            <p className="mt-2 text-lg text-mist">{p.title}</p>
            {reviews.length > 0 && (
              <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm text-mist hover:text-white">
                <Stars value={avg} size={18} /><b className="font-display text-lg text-gold">{avg.toFixed(1)}</b>({reviews.length} تقييم)
              </a>
            )}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm md:justify-start">
              {[p.country, p.server, p.languages].filter(Boolean).map((t) => (
                <span key={t} className="rounded-full bg-white/5 px-3 py-1 text-mist">{t}</span>
              ))}
              {p.tiktok && (
                <a href={`https://www.tiktok.com/@${p.tiktok}`} target="_blank" rel="noopener noreferrer"
                  className="rounded-full border border-rose/40 bg-rose/10 px-3 py-1 text-rose hover:bg-rose/20" dir="ltr">
                  TikTok @{p.tiktok}
                </a>
              )}
            </div>
          </div>
          <div className="mx-auto text-center">
            <SigilRing total={p.slotsPerSeason} taken={taken} size={150} />
            <p className="mt-1 text-sm text-mist">{season ? `مقاعد ${season.name}` : "لا موسم نشط"}</p>
          </div>
        </div>

        <dl className="relative mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {[
            ["الجهاز", p.device || "—"],
            ["سنوات اللعب", p.experienceYrs],
            ["حساب أنجزه", completed],
            ["كونكر كلاسيك", `${p.classicConqs}×`],
            ["كونكر ألتميت", `${p.ultimateConqs}×`],
            ["أعلى مترو", p.metroTier || "—"],
          ].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/10 bg-night/40 p-3 text-center">
              <dd className="font-display text-2xl text-gold">{v}</dd>
              <dt className="mt-1 text-xs text-mist">{k}</dt>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_420px]">
        <div className="space-y-8">
          {/* ── PRICES ── */}
          <section data-reveal className="shard p-6">
            <h2 className="font-display text-2xl">الأسعار ومدة الإنجاز</h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {p.services.map((s) => (
                <div key={s.id} className="rounded-xl border border-white/10 bg-night/40 p-4 text-center">
                  <div className="flex justify-center"><Crystal kind={s.service as ServiceKey} size={72} /></div>
                  <h3 className="font-display text-lg">{SERVICES[s.service as ServiceKey].name}</h3>
                  <p className="mt-1 font-display text-3xl text-gold">{money(s.price)}</p>
                  <p className="mt-1 text-sm text-ice">ينجز خلال {s.days} {s.days > 10 || s.days < 3 ? "يوم" : "أيام"}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── TRUST ── */}
          <section data-reveal className="shard p-6">
            <h2 className="font-display text-2xl">سجل الثقة</h2>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2">
              {checks.map(([ok, t, d]) => (
                <li key={t} className={`flex gap-3 rounded-xl border p-4 ${ok ? "border-gold/40 bg-gold/5" : "border-white/10 opacity-60"}`}>
                  <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${ok ? "bg-gold text-night" : "bg-white/10"}`}>{ok ? "✓" : "…"}</span>
                  <div><b className="font-display">{t}</b><p className="text-sm text-mist">{ok ? d : "قيد التحقق"}</p></div>
                </li>
              ))}
            </ul>
          </section>

          {(p.bio || p.achievements) && (
            <section data-reveal className="shard p-6">
              <h2 className="font-display text-2xl">عن الحارس</h2>
              {p.bio && <p className="mt-3 whitespace-pre-line leading-8 text-mist">{p.bio}</p>}
              {p.achievements && (
                <ul className="mt-4 space-y-2">
                  {p.achievements.split("\n").filter(Boolean).map((a) => (
                    <li key={a} className="flex gap-2 text-white"><span className="text-gold">◆</span>{a}</li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {/* ── TIKTOK CLIPS ── */}
          {(clips.length > 0 || p.tiktok) && (
            <section data-reveal className="shard p-6">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">لقطات من لعبه</h2>
                {p.tiktok && <a href={`https://www.tiktok.com/@${p.tiktok}`} target="_blank" rel="noopener noreferrer" className="text-sm text-rose" dir="ltr">@{p.tiktok} ↗</a>}
              </div>
              {clips.length ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {clips.map((id) => (
                    <iframe key={id} src={`https://www.tiktok.com/embed/v2/${id}`} title="TikTok" loading="lazy"
                      className="aspect-[9/16] w-full rounded-xl border border-white/10 bg-night" allow="encrypted-media; fullscreen" />
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-mist">شاهد لقطاته على حسابه في تيك توك.</p>
              )}
            </section>
          )}

          {/* ── REVIEWS — only from customers whose account was completed ── */}
          <section id="reviews" data-reveal className="shard scroll-mt-24 p-6">
            <h2 className="font-display text-2xl">تقييمات من وصلوا القمّة</h2>
            {reviews.length ? (
              <>
                <div className="mt-5 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
                  <div className="text-center">
                    <div className="font-display text-6xl text-gold drop-shadow-[0_0_18px_#ffcf6b66]">{avg.toFixed(1)}</div>
                    <Stars value={avg} size={20} />
                    <p className="mt-1 text-xs text-mist">{reviews.length} تقييم موثّق</p>
                  </div>
                  <ul className="space-y-1.5">
                    {dist.map(([s, n]) => (
                      <li key={s} className="flex items-center gap-3 text-sm">
                        <span className="w-8 text-mist">{s} ★</span>
                        <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                          <span className="block h-full rounded-full bg-gradient-to-l from-gold to-ember" style={{ width: `${(n / reviews.length) * 100}%` }} />
                        </span>
                        <span className="w-6 text-left text-mist">{n}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <ul className="mt-6 space-y-3">
                  {reviews.map((r) => (
                    <li key={r.id} className="rounded-xl border border-white/10 bg-night/40 p-4">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <b className="font-display">{reviewerName(r.user.name)}</b>
                        <Stars value={r.rating} size={14} />
                        <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] text-gold">✓ حساب منجز · {SERVICES[r.booking.service as ServiceKey].short}</span>
                        <span className="ms-auto text-xs text-mist/60">{fmtDate(r.createdAt)}</span>
                      </div>
                      {r.text && <p className="mt-2 whitespace-pre-line leading-7 text-mist">{r.text}</p>}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-3 text-mist">لا توجد تقييمات بعد. التقييم متاح فقط لمن أنجز الحارس حسابه — لا تقييمات وهمية.</p>
            )}
          </section>
        </div>

        {/* ── BOOKING ── */}
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <div data-reveal className="shard p-6">
            <h2 className="font-display text-2xl">احجز مقعداً</h2>
            {!season ? (
              <p className="mt-3 text-mist">لا يوجد موسم مفتوح حالياً.</p>
            ) : left === 0 ? (
              <p className="mt-3 text-rose">اكتملت المقاعد الثمانية لهذا الموسم. تابعنا للموسم القادم.</p>
            ) : !user ? (
              <div className="mt-4 space-y-3">
                <p className="text-mist">سجّل دخولك لتحجز مقعدك — متبقٍ {left} من {p.slotsPerSeason}.</p>
                <Link href={`/login?next=/players/${p.slug}`} className="btn-summit w-full">دخول / إنشاء حساب</Link>
              </div>
            ) : (
              <BookingForm slug={p.slug} server={p.server}
                services={p.services.map((s) => ({ key: s.service, name: SERVICES[s.service as ServiceKey].name, price: s.price, days: s.days }))} />
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
