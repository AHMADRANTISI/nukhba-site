"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requirePlayer } from "@/lib/auth";
import { db, SERVICE_KEYS, STATUS } from "@/lib/core";
import { saveImage } from "@/lib/upload";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Math.max(0, parseInt(str(f, k)) || 0);

// The provider fills in everything shown on their card. Trust checks, seats and
// publishing stay with the admin.
export async function saveMyProfile(f: FormData) {
  const { player } = await requirePlayer("/pro/profile");
  const name = str(f, "name");
  if (!name) redirect("/pro/profile?error=name");
  let avatar: string | null = null;
  try {
    avatar = await saveImage(f.get("avatar") as File, "avatars", player.slug);
  } catch {
    redirect("/pro/profile?error=avatar");
  }
  await db.player.update({
    where: { id: player.id },
    data: {
      name, title: str(f, "title"), country: str(f, "country"), server: str(f, "server"), languages: str(f, "languages"),
      device: str(f, "device"), bio: str(f, "bio"), achievements: str(f, "achievements"),
      tiktok: str(f, "tiktok").replace(/^@/, ""), tiktokVideos: str(f, "tiktokVideos"),
      experienceYrs: int(f, "experienceYrs"), classicConqs: int(f, "classicConqs"), ultimateConqs: int(f, "ultimateConqs"),
      completedBase: int(f, "completedBase"), winRate: Math.min(100, int(f, "winRate")), kd: parseFloat(str(f, "kd")) || 0,
      ...(avatar ? { avatar } : {}),
    },
  });
  for (const s of SERVICE_KEYS) {
    const price = int(f, `price_${s}`);
    const days = Math.max(1, int(f, `days_${s}`) || 7);
    const enabled = f.get(`on_${s}`) === "on" && price > 0;
    await db.playerService.upsert({
      where: { playerId_service: { playerId: player.id, service: s } },
      update: { price, days, enabled },
      create: { playerId: player.id, service: s, price, days, enabled },
    });
  }
  revalidatePath("/", "layout");
  redirect("/pro/profile?saved=1");
}

// Once the admin confirms payment, the provider runs the climb: start, report progress, finish.
const NEXT: Record<string, string[]> = { CONFIRMED: ["CONFIRMED", "IN_PROGRESS"], IN_PROGRESS: ["IN_PROGRESS", "COMPLETED"] };

export async function updateMyBooking(f: FormData) {
  const { player } = await requirePlayer();
  const b = await db.booking.findUnique({ where: { id: str(f, "id") } });
  if (!b || b.playerId !== player.id || !NEXT[b.status]) return;
  const status = str(f, "status");
  if (!NEXT[b.status].includes(status)) return;
  const progress = status === "COMPLETED" ? 100 : Math.min(99, int(f, "progress"));
  const note = str(f, "note").slice(0, 300);
  const events: string[] = [];
  if (status !== b.status) events.push(`الحالة: ${STATUS[status].label}`);
  if (progress !== b.progress && status !== "COMPLETED") events.push(`التقدّم ${progress}%`);
  const extra = str(f, "event").slice(0, 200);
  if (extra) events.push(extra);
  await db.booking.update({
    where: { id: b.id },
    data: {
      status, progress, adminNote: note,
      ...(status === "COMPLETED" ? { credentials: null } : {}),
      events: { create: events.map((text) => ({ text: `${text} — ${player.name}` })) },
    },
  });
  revalidatePath("/pro");
}
