import { notFound } from "next/navigation";
import Link from "next/link";
import { db, SERVICE_KEYS, SERVICES } from "@/lib/core";
import { Avatar } from "@/components/Art";
import { savePlayer } from "../../actions";

export default async function EditPlayer({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const p = id === "new" ? null : await db.player.findUnique({ where: { id }, include: { services: true } });
  if (id !== "new" && !p) notFound();
  const svc = (k: string) => p?.services.find((s) => s.service === k);

  const text = (name: string, label: string, v?: string | number | null, props: React.InputHTMLAttributes<HTMLInputElement> = {}) => (
    <div><label className="label" htmlFor={name}>{label}</label><input id={name} name={name} defaultValue={v ?? ""} className="field" {...props} /></div>
  );

  return (
    <form action={savePlayer} className="space-y-6">
      <input type="hidden" name="id" value={p?.id ?? ""} />
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl">{p ? `تعديل ${p.name}` : "حارس جديد"}</h1>
        {saved && <span className="rounded-full bg-gold/20 px-3 py-1 text-sm text-gold">تم الحفظ</span>}
        {p && <Link href={`/players/${p.slug}`} className="text-sm text-ice">عرض الملف ↗</Link>}
      </div>

      <section className="shard grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 sm:col-span-2 lg:col-span-3">
          <Avatar name={p?.name ?? "؟"} file={p?.avatar} size={84} />
          <div className="flex-1"><label className="label" htmlFor="avatar">صورة اللاعب</label>
            <input id="avatar" name="avatar" type="file" accept="image/png,image/jpeg,image/webp" className="field" /></div>
        </div>
        {text("name", "الاسم في اللعبة *", p?.name, { required: true, dir: "ltr" })}
        {text("slug", "رابط الملف (إنجليزي) *", p?.slug, { required: true, dir: "ltr", placeholder: "saqr" })}
        {text("title", "الوصف القصير", p?.title)}
        {text("country", "البلد", p?.country)}
        {text("server", "السيرفر", p?.server ?? "الشرق الأوسط")}
        {text("languages", "اللغات", p?.languages ?? "العربية")}
        {text("device", "نوع الجهاز", p?.device, { placeholder: "iPad Pro M4" })}
        {text("experienceYrs", "سنوات اللعب", p?.experienceYrs, { type: "number", min: 0 })}
        {text("completedBase", "حسابات أنجزها قبل الانضمام", p?.completedBase, { type: "number", min: 0 })}
        {text("classicConqs", "مرات كونكر كلاسيك", p?.classicConqs, { type: "number", min: 0 })}
        {text("ultimateConqs", "مرات كونكر ألتميت", p?.ultimateConqs, { type: "number", min: 0 })}
        {text("kd", "K/D", p?.kd, { type: "number", step: "0.1", min: 0 })}
        {text("winRate", "نسبة الفوز %", p?.winRate, { type: "number", min: 0, max: 100 })}
        {text("slotsPerSeason", "عدد المقاعد في الموسم", p?.slotsPerSeason ?? 8, { type: "number", min: 1 })}
        {text("tiktok", "حساب تيك توك (بدون @)", p?.tiktok, { dir: "ltr" })}
        {text("sort", "الترتيب", p?.sort ?? 0, { type: "number" })}
        <div className="sm:col-span-2 lg:col-span-3"><label className="label">نبذة</label><textarea name="bio" rows={3} defaultValue={p?.bio} className="field" /></div>
        <div className="sm:col-span-2 lg:col-span-3 grid gap-4 sm:grid-cols-2">
          <div><label className="label">الإنجازات (سطر لكل إنجاز)</label><textarea name="achievements" rows={4} defaultValue={p?.achievements} className="field" /></div>
          <div><label className="label">روابط لقطات تيك توك (رابط في كل سطر)</label><textarea name="tiktokVideos" rows={4} dir="ltr" defaultValue={p?.tiktokVideos} placeholder="https://www.tiktok.com/@name/video/123..." className="field" /></div>
        </div>
      </section>

      <section className="shard p-6">
        <h2 className="font-display text-xl">الأسعار ومدة الإنجاز حسب نوع الرانك</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {SERVICE_KEYS.map((k) => (
            <div key={k} className="space-y-2 rounded-xl border border-white/10 p-4">
              <label className="flex items-center gap-2 font-display"><input type="checkbox" name={`on_${k}`} defaultChecked={svc(k)?.enabled ?? !p} className="accent-[#ffcf6b]" />{SERVICES[k].name}</label>
              <input name={`price_${k}`} type="number" min={0} placeholder="السعر $" defaultValue={svc(k)?.price ?? ""} className="field" />
              <input name={`days_${k}`} type="number" min={1} placeholder="عدد أيام الإنجاز" defaultValue={svc(k)?.days ?? 7} className="field" />
            </div>
          ))}
        </div>
      </section>

      <section className="shard p-6">
        <h2 className="font-display text-xl">سجل الثقة — لا يُنشر الحارس إلا بعد اكتمال الأربعة</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {([["idVerified", "تم التحقق من الهوية"], ["cleanRecord", "سجل نظيف بلا حظر أو غش"], ["gameplayReview", "تمت مراجعة تسجيلات لعبه"], ["pledgeSigned", "وقّع ميثاق اللعب النظيف"]] as const).map(([k, t]) => (
            <label key={k} className="flex items-center gap-3 rounded-xl border border-white/10 p-3">
              <input type="checkbox" name={k} defaultChecked={p?.[k] ?? false} className="h-5 w-5 accent-[#ffcf6b]" />{t}
            </label>
          ))}
        </div>
        <label className="mt-4 flex items-center gap-3"><input type="checkbox" name="active" defaultChecked={p?.active ?? true} className="h-5 w-5 accent-[#ffcf6b]" />منشور على الموقع</label>
      </section>

      <button className="btn-summit">حفظ الحارس</button>
    </form>
  );
}
