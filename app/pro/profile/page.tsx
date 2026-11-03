import { requirePlayer } from "@/lib/auth";
import { activeSeason, db, missingCardFields, ratings, SERVICE_KEYS, SERVICES, slotWhere } from "@/lib/core";
import { Avatar } from "@/components/Art";
import PlayerCard, { playerSelect, withCompleted } from "@/components/PlayerCard";
import { saveMyProfile } from "../actions";

export const metadata = { title: "بطاقتي — نخبة" };

const ERRORS: Record<string, string> = { name: "الاسم في اللعبة مطلوب", avatar: "الصورة يجب أن تكون JPG أو PNG أو WEBP وأقل من 5MB" };

export default async function MyCard({ searchParams }: { searchParams: Promise<{ saved?: string; welcome?: string; error?: string }> }) {
  const { saved, welcome, error } = await searchParams;
  const { player } = await requirePlayer("/pro/profile");
  const season = await activeSeason();
  const [p, card, used, rated] = await Promise.all([
    db.player.findUniqueOrThrow({ where: { id: player.id }, include: { services: true } }),
    db.player.findUniqueOrThrow({ where: { id: player.id }, select: playerSelect }),
    season ? db.booking.count({ where: slotWhere(player.id, season.id) }) : 0,
    ratings(),
  ]);
  const svc = (k: string) => p.services.find((s) => s.service === k);
  const missing = missingCardFields(p, p.services.filter((s) => s.enabled).length);

  const text = (name: string, label: string, v?: string | number | null, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} defaultValue={v ?? ""} className="field" {...props} /></div>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      <form action={saveMyProfile} className="space-y-6">
        {welcome && <p className="shard border-gold/40 p-4 text-sm leading-7">أهلاً بك في نخبة 👑 — عبّئ بطاقتك كاملة. بعد الحفظ تراجعها الإدارة وتتحقق من هويتك قبل نشرها.</p>}
        {saved && <p className="rounded-xl bg-gold/15 p-3 text-sm text-gold">تم حفظ بطاقتك.</p>}
        {error && <p role="alert" className="rounded-xl bg-rose/10 p-3 text-sm text-rose">{ERRORS[error] ?? "تعذّر الحفظ"}</p>}

        <section className="shard grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-xl sm:col-span-2">بيانات البطاقة</h2>
          <div className="flex items-center gap-4 sm:col-span-2">
            <Avatar name={p.name} file={p.avatar} size={76} />
            <div className="flex-1"><label className="label" htmlFor="avatar">صورتك</label>
              <input id="avatar" name="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="field" /></div>
          </div>
          {text("name", "اسمك في اللعبة *", p.name, { required: true, dir: "ltr" })}
          {text("title", "الوصف القصير *", p.title, { required: true, placeholder: "مثال: صيّاد الكونكر الهادئ", maxLength: 40 })}
          {text("country", "البلد *", p.country, { required: true })}
          {text("device", "نوع الجهاز *", p.device, { required: true, placeholder: "iPad Pro" })}
          {text("experienceYrs", "سنوات الخبرة *", p.experienceYrs || "", { type: "number", min: 1, required: true })}
          {text("completedBase", "حسابات أنجزتها قبل الانضمام", p.completedBase, { type: "number", min: 0 })}
          {text("ultimateConqs", "مرات وصولك كونكر ألتميت", p.ultimateConqs, { type: "number", min: 0 })}
          {text("classicConqs", "مرات وصولك كونكر كلاسيك", p.classicConqs, { type: "number", min: 0 })}
        </section>

        <section className="shard p-6">
          <h2 className="font-display text-xl">أسعارك ومدة الإنجاز</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {SERVICE_KEYS.map((k) => (
              <div key={k} className="space-y-2 rounded-xl border border-white/10 p-4">
                <label className="flex items-center gap-2 font-display"><input type="checkbox" name={`on_${k}`} defaultChecked={svc(k)?.enabled ?? true} className="accent-[#ffcf6b]" />{SERVICES[k].name}</label>
                <input name={`price_${k}`} type="number" min={0} placeholder="السعر $" defaultValue={svc(k)?.price || ""} className="field" />
                <input name={`days_${k}`} type="number" min={1} placeholder="عدد أيام الإنجاز" defaultValue={svc(k)?.days ?? 7} className="field" />
              </div>
            ))}
          </div>
        </section>

        <section className="shard grid gap-4 p-6 sm:grid-cols-2">
          <h2 className="font-display text-xl sm:col-span-2">تفاصيل ملفك الكامل</h2>
          {text("server", "السيرفر", p.server)}
          {text("languages", "اللغات", p.languages)}
          {text("kd", "K/D", p.kd, { type: "number", step: "0.1", min: 0 })}
          {text("winRate", "نسبة الفوز %", p.winRate, { type: "number", min: 0, max: 100 })}
          {text("tiktok", "حساب تيك توك (بدون @)", p.tiktok, { dir: "ltr" })}
          <div className="sm:col-span-2"><label className="label">نبذة عنك</label><textarea name="bio" rows={3} defaultValue={p.bio} className="field" /></div>
          <div><label className="label">إنجازاتك (سطر لكل إنجاز)</label><textarea name="achievements" rows={4} defaultValue={p.achievements} className="field" /></div>
          <div><label className="label">روابط لقطاتك على تيك توك (رابط في كل سطر)</label><textarea name="tiktokVideos" rows={4} dir="ltr" defaultValue={p.tiktokVideos} placeholder="https://www.tiktok.com/@name/video/123..." className="field" /></div>
        </section>

        <button className="btn-summit">حفظ بطاقتي</button>
      </form>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <h2 className="font-display text-xl">هكذا يراك العملاء</h2>
        <PlayerCard p={withCompleted(card)} taken={used} rating={rated.get(p.id)} />
        <div className="shard p-4 text-sm leading-7 text-mist">
          {p.active ? <p className="text-gold">✓ منشورة على الموقع</p>
            : missing.length ? <p>ناقص: <span className="text-rose">{missing.join(" · ")}</span></p>
            : <p>مكتملة — بانتظار تحقق الإدارة قبل النشر.</p>}
          <p className="mt-1 text-xs">التقييمات وعدد المقاعد تُحسب تلقائياً ولا يمكن تعديلها.</p>
        </div>
      </aside>
    </div>
  );
}
