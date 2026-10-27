import { activeSeason, db, takenSlots } from "@/lib/core";
import PlayerCard, { playerSelect, withCompleted } from "@/components/PlayerCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "حرّاس القمة — قِمّة" };

export default async function Players() {
  const season = await activeSeason();
  const [players, taken] = await Promise.all([
    db.player.findMany({ where: { active: true }, orderBy: { sort: "asc" }, select: playerSelect }),
    takenSlots(season?.id),
  ]);
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <div data-reveal className="text-center">
        <p className="font-display text-sm tracking-[.3em] text-ice">{season?.name ?? "لا يوجد موسم نشط"}</p>
        <h1 className="mt-2 font-display text-5xl">حرّاس القمة</h1>
        <p className="mx-auto mt-3 max-w-lg text-mist">كل حارس موثّق بأربع خطوات وله 8 مقاعد فقط في الموسم.</p>
      </div>
      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {players.map((p, i) => <PlayerCard key={p.id} p={withCompleted(p)} taken={taken.get(p.id) ?? 0} delay={(i % 2) * 0.1} />)}
      </div>
      {!players.length && <p className="mt-12 text-center text-mist">لا يوجد حرّاس منشورون بعد.</p>}
    </section>
  );
}
