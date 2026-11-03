import Link from "next/link";
import { db, trustScore } from "@/lib/core";
import { Avatar } from "@/components/Art";

export default async function AdminPlayers() {
  const players = await db.player.findMany({ orderBy: [{ active: "asc" }, { sort: "asc" }], include: { user: { select: { email: true } } } });
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-3xl">اللاعبين</h1>
        <Link href="/admin/players/new" className="btn-summit">+ لاعب جديد</Link>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {players.map((p) => (
          <Link key={p.id} href={`/admin/players/${p.id}`} className="shard flex items-center gap-4 p-4 hover:bg-white/5">
            <Avatar name={p.name} file={p.avatar} size={52} />
            <div className="flex-1">
              <div className="font-display text-lg" dir="ltr" style={{ textAlign: "right" }}>{p.name}</div>
              <div className="text-xs text-mist">توثيق {trustScore(p)}/4 · {p.slotsPerSeason} مقاعد{p.user && <> · <span dir="ltr">{p.user.email}</span></>}</div>
            </div>
            <span className={`rounded-full px-3 py-1 text-xs ${p.active ? "bg-gold/20 text-gold" : p.user && !p.verifiedAt ? "bg-ice/20 text-ice" : "bg-white/10 text-mist"}`}>{p.active ? "منشور" : p.user && !p.verifiedAt ? "طلب انضمام" : "مخفي"}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
