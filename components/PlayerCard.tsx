import Link from "next/link";
import { byServiceOrder, SERVICE_KEYS, SERVICES, money, trustScore, type ServiceKey } from "@/lib/core";
import { Avatar, SigilRing, TrustSeal } from "./Art";
import { Stars, type RatingSummary } from "./Stars";

type P = {
  slug: string; name: string; title: string; avatar: string | null; country: string; device: string;
  experienceYrs: number; classicConqs: number; ultimateConqs: number; slotsPerSeason: number; completed: number;
  idVerified: boolean; cleanRecord: boolean; gameplayReview: boolean; pledgeSigned: boolean;
  services: { service: string; price: number; days: number }[];
};

// A guardian "dossier" card — tilts in 3D under the cursor, shows the 8-slot sigil.
export default function PlayerCard({ p, taken, rating, delay = 0 }: { p: P; taken: number; rating?: RatingSummary; delay?: number }) {
  const left = p.slotsPerSeason - taken;
  const from = p.services.length ? Math.min(...p.services.map((s) => s.price)) : 0;
  return (
    <Link href={`/players/${p.slug}`} data-reveal style={{ ["--d" as string]: `${delay}s` }} className="group block">
      <article className="tilt shard scanline h-full p-5">
        <div className="glare pointer-events-none absolute inset-0" />
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar name={p.name} file={p.avatar} size={76} />
            <div className="absolute -bottom-3 -left-3"><TrustSeal score={trustScore(p)} size={36} /></div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-display text-2xl tracking-wide text-white" dir="ltr" style={{ textAlign: "right" }}>{p.name}</h3>
            <p className="truncate text-sm text-mist">{p.title}</p>
            <p className="mt-1 text-xs text-mist/60">{[p.country, p.device].filter(Boolean).join(" • ")}</p>
            <p className="mt-1.5 flex items-center gap-2 text-xs text-mist">
              {rating?.count ? (
                <><Stars value={rating.avg} size={13} /><b className="text-gold">{rating.avg.toFixed(1)}</b>({rating.count} تقييم)</>
              ) : <span className="text-mist/50">لا تقييمات بعد</span>}
            </p>
          </div>
          <SigilRing total={p.slotsPerSeason} taken={taken} size={78} />
        </div>

        <dl className="mt-5 grid grid-cols-4 gap-2 text-center">
          {[
            ["كونكر ألتميت", p.ultimateConqs],
            ["كونكر كلاسيك", p.classicConqs],
            ["حساب منجز", p.completed],
            ["سنوات خبرة", p.experienceYrs],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg bg-white/5 py-2">
              <dd className="font-display text-xl text-gold">{v}</dd>
              <dt className="text-[10px] text-mist/70">{k}</dt>
            </div>
          ))}
        </dl>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {p.services.map((s) => (
            <span key={s.service} className="rounded-full border border-white/10 px-2.5 py-0.5 text-[11px] text-mist">
              {SERVICES[s.service as ServiceKey]?.short} · {money(s.price)}
            </span>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-sm">
          <span className="text-mist">يبدأ من <b className="font-display text-lg text-white">{money(from)}</b></span>
          <span className={left > 0 ? "text-ice group-hover:text-gold" : "text-rose"}>
            {left > 0 ? "احجز مقعدك ←" : "اكتمل هذا الموسم"}
          </span>
        </div>
      </article>
    </Link>
  );
}

export const playerSelect = {
  id: true, slug: true, name: true, title: true, avatar: true, country: true, device: true,
  experienceYrs: true, classicConqs: true, ultimateConqs: true, slotsPerSeason: true, completedBase: true,
  idVerified: true, cleanRecord: true, gameplayReview: true, pledgeSigned: true,
  services: { where: { enabled: true, service: { in: SERVICE_KEYS } }, select: { service: true, price: true, days: true } },
  _count: { select: { bookings: { where: { status: "COMPLETED" } } } },
} as const;

export function withCompleted<T extends { completedBase: number; _count: { bookings: number }; services: { service: string }[] }>(p: T) {
  return { ...p, services: [...p.services].sort(byServiceOrder), completed: p.completedBase + p._count.bookings };
}
