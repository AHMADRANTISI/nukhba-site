import Link from "next/link";
import { db, trustScore } from "@/lib/core";
import { Avatar } from "@/components/Art";

export default async function AdminPlayers() {
  const players = await db.player.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">الحرّاس</h1>
        <Link href="/admin/players/new" className="btn-summit">+ حارس جديد</Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {players.map((p) => (
          <Link key={p.id} href={`/admin/players/${p.id}`} className="shard flex items-center gap-4 p-4 hover:bg-white/5">
            <Avatar name={p.name} file={p.avatar} size={52} />
            <div className="flex-1">
              <div className="font-display text-lg" dir="ltr" style={{ textAlign: "right" }}>{p.name}</div>
              <div className="text-xs text-mist">توثيق {trustScore(p)}/4 · {p.slotsPerSeason} مقاعد</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${p.active ? "bg-gold/20 text-gold" : "bg-white/10 text-mist"}`}>{p.active ? "منشور" : "مخفي"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
