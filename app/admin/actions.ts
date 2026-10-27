"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { db, SERVICE_KEYS, STATUS } from "@/lib/core";
import { saveImage } from "@/lib/upload";

const str = (f: FormData, k: string) => String(f.get(k) ?? "").trim();
const int = (f: FormData, k: string) => Math.max(0, parseInt(str(f, k)) || 0);

export async function updateBooking(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const b = await db.booking.findUniqueOrThrow({ where: { id } });
  const status = str(f, "status");
  if (!STATUS[status]) return;
  const progress = Math.min(100, int(f, "progress"));
  const adminNote = str(f, "adminNote");
  const done = status === "COMPLETED" || status === "CANCELLED";
  const events: string[] = [];
  if (status !== b.status) events.push(`الحالة: ${STATUS[status].label}`);
  if (progress !== b.progress) events.push(`التقدّم ${progress}%`);
  if (done && b.credentials) events.push("تم مسح بيانات دخول الحساب نهائياً");
  const extra = str(f, "event");
  if (extra) events.push(extra);
  await db.booking.update({
    where: { id },
    data: {
      status, progress: status === "COMPLETED" ? 100 : progress, adminNote,
      ...(done ? { credentials: null } : {}),
      events: { create: events.map((text) => ({ text })) },
    },
  });
  revalidatePath(`/admin/bookings/${id}`);
}

export async function savePlayer(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  const slug = str(f, "slug").toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");
  if (!slug || !str(f, "name")) throw new Error("الاسم والرابط مطلوبان");
  const trust = {
    idVerified: f.get("idVerified") === "on",
    cleanRecord: f.get("cleanRecord") === "on",
    gameplayReview: f.get("gameplayReview") === "on",
    pledgeSigned: f.get("pledgeSigned") === "on",
  };
  const allOk = Object.values(trust).every(Boolean);
  const data = {
    slug, name: str(f, "name"), title: str(f, "title"), country: str(f, "country"), server: str(f, "server"),
    languages: str(f, "languages"), device: str(f, "device"), bio: str(f, "bio"), achievements: str(f, "achievements"),
    tiktok: str(f, "tiktok").replace(/^@/, ""), tiktokVideos: str(f, "tiktokVideos"),
    experienceYrs: int(f, "experienceYrs"), classicConqs: int(f, "classicConqs"), ultimateConqs: int(f, "ultimateConqs"),
    completedBase: int(f, "completedBase"), winRate: Math.min(100, int(f, "winRate")), kd: parseFloat(str(f, "kd")) || 0,
    slotsPerSeason: Math.max(1, int(f, "slotsPerSeason") || 8), sort: int(f, "sort"),
    active: f.get("active") === "on" && allOk, // only fully verified players can be published
    ...trust,
  };
  const avatar = await saveImage(f.get("avatar") as File, "avatars", slug);
  const player = id
    ? await db.player.update({ where: { id }, data: { ...data, ...(avatar ? { avatar } : {}) } })
    : await db.player.create({ data: { ...data, avatar } });
  if (allOk && !player.verifiedAt) await db.player.update({ where: { id: player.id }, data: { verifiedAt: new Date() } });
  if (!allOk && player.verifiedAt) await db.player.update({ where: { id: player.id }, data: { verifiedAt: null } });

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
  redirect(`/admin/players/${player.id}?saved=1`);
}

export async function createSeason(f: FormData) {
  await requireAdmin();
  const name = str(f, "name");
  const startsAt = new Date(str(f, "startsAt"));
  const endsAt = new Date(str(f, "endsAt"));
  if (!name || isNaN(+startsAt) || isNaN(+endsAt)) return;
  await db.season.create({ data: { name, startsAt, endsAt } });
  revalidatePath("/admin/settings");
}

export async function activateSeason(f: FormData) {
  await requireAdmin();
  await db.$transaction([
    db.season.updateMany({ data: { active: false } }),
    db.season.update({ where: { id: str(f, "id") }, data: { active: true } }),
  ]);
  revalidatePath("/", "layout");
}

export async function savePaymentMethod(f: FormData) {
  await requireAdmin();
  const id = str(f, "id");
  if (f.get("delete")) {
    await db.paymentMethod.delete({ where: { id } });
  } else {
    const data = { name: str(f, "name"), details: str(f, "details"), active: f.get("active") === "on", sort: int(f, "sort") };
    if (!data.name) return;
    if (id) await db.paymentMethod.update({ where: { id }, data });
    else await db.paymentMethod.create({ data });
  }
  revalidatePath("/admin/settings");
}

export async function saveSettings(f: FormData) {
  await requireAdmin();
  for (const key of ["whatsapp", "telegram"]) {
    const value = str(f, key);
    await db.setting.upsert({ where: { key }, update: { value }, create: { key, value } });
  }
  revalidatePath("/", "layout");
}

// Moderation: hidden reviews disappear from the profile and from the average.
export async function toggleReview(f: FormData) {
  await requireAdmin();
  const r = await db.review.findUniqueOrThrow({ where: { id: str(f, "id") } });
  await db.review.update({ where: { id: r.id }, data: { hidden: !r.hidden } });
  revalidatePath("/", "layout");
}
