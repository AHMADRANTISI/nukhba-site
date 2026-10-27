import { notFound } from "next/navigation";
import { db, decrypt, MODES, money, SERVICES, STATUS, type ServiceKey } from "@/lib/core";
import { StatusPill } from "@/components/StatusPill";
import { updateBooking } from "../../actions";

export default async function AdminBooking({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const b = await db.booking.findUnique({
    where: { id },
    include: { player: true, user: true, season: true, events: { orderBy: { createdAt: "desc" } } },
  });
  if (!b) notFound();
  let creds: { user: string; pass: string } | null = null;
  try { creds = b.credentials ? JSON.parse(decrypt(b.credentials)) : null; } catch { creds = null; }

  const rows: [string, string][] = [
    ["العميل", `${b.user.name} — ${b.user.email} — ${b.user.phone}`],
    ["تواصل", b.contact],
    ["الحارس", b.player.name],
    ["الخدمة", `${SERVICES[b.service as ServiceKey].name} — ${money(b.price)}`],
    ["الموسم", b.season.name],
    ["الطريقة", MODES[b.mode] ?? b.mode],
    ["اسم اللاعب / ID", `${b.gameName} — ${b.gameId}`],
    ["السيرفر", b.server],
    ["ملاحظات العميل", b.notes || "—"],
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <div className="shard p-6">
          <div className="flex items-center gap-3"><h1 className="font-display text-3xl" dir="ltr">{b.code}</h1><StatusPill status={b.status} /></div>
          <dl className="mt-5 divide-y divide-white/5 text-sm">
            {rows.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-3 py-2"><dt className="text-mist">{k}</dt><dd dir="auto">{v}</dd></div>
            ))}
          </dl>
        </div>

        {b.credentials && (
          <div className="shard border-ice/30 p-6">
            <h2 className="font-display text-xl text-ice">بيانات الدخول (سرّية)</h2>
            {creds ? (
              <details className="mt-3">
                <summary className="text-sm text-mist">إظهار — {b.loginType}</summary>
                <div className="mt-3 space-y-1 rounded-lg bg-night p-3 font-mono text-sm" dir="ltr">
                  <div>{creds.user}</div><div>{creds.pass}</div>
                </div>
              </details>
            ) : <p className="mt-2 text-sm text-mist">تم مسحها.</p>}
          </div>
        )}

        {b.proofFile && (
          <div className="shard p-6">
            <h2 className="font-display text-xl">إثبات الدفع</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <a href={`/media/proofs/${b.proofFile}`} target="_blank"><img src={`/media/proofs/${b.proofFile}`} alt="إثبات الدفع" className="mt-3 max-h-96 rounded-lg" /></a>
          </div>
        )}
      </div>

      <div className="space-y-6">
        <form key={b.updatedAt.getTime()} action={updateBooking} className="shard space-y-4 p-6">
          <input type="hidden" name="id" value={b.id} />
          <h2 className="font-display text-xl">تحديث الحجز</h2>
          <div><label className="label">الحالة</label>
            <select name="status" defaultValue={b.status} className="field">
              {Object.entries(STATUS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div><label className="label">التقدّم %</label><input name="progress" type="number" min={0} max={100} defaultValue={b.progress} className="field" /></div>
          <div><label className="label">ملاحظة ظاهرة للعميل</label><input name="adminNote" defaultValue={b.adminNote} className="field" /></div>
          <div><label className="label">إضافة حدث للسجل</label><input name="event" placeholder="مثال: وصل إلى إيس دومينيتور" className="field" /></div>
          <p className="text-xs text-mist">عند «وصل القمة» أو «ملغى» تُمسح بيانات الدخول تلقائياً.</p>
          <button className="btn-summit w-full">حفظ</button>
        </form>
        <div className="shard p-6">
          <h2 className="font-display text-xl">السجل</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {b.events.map((e) => <li key={e.id}><span className="text-mist/60">{e.createdAt.toLocaleString("ar-EG")}</span> — {e.text}</li>)}
          </ul>
        </div>
      </div>
    </div>
  );
}
