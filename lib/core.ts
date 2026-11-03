import { PrismaClient } from "@prisma/client";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const g = globalThis as unknown as { db?: PrismaClient };
export const db = g.db ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") g.db = db;

export const SERVICES = {
  ULTIMATE: { name: "كونكر ألتميت", short: "ألتميت", hue: "violet", blurb: "طور الألتميت رويال بفريق واحد ضد الكل — للمحترفين فقط." },
  CLASSIC: { name: "كونكر كلاسيك", short: "كلاسيك", hue: "gold", blurb: "من أي رانك حتى قمة الكلاسيك — نقاط ثابتة ولعب نظيف." },
  // No longer offered; kept only so older bookings still show a label.
  METRO: { name: "مترو رويال", short: "مترو", hue: "cyan", blurb: "" },
} as const;
export type ServiceKey = keyof typeof SERVICES;
// Services that can be booked, in display order.
export const SERVICE_KEYS: ServiceKey[] = ["ULTIMATE", "CLASSIC"];
export const byServiceOrder = (a: { service: string }, b: { service: string }) =>
  SERVICE_KEYS.indexOf(a.service as ServiceKey) - SERVICE_KEYS.indexOf(b.service as ServiceKey);

export const STATUS: Record<string, { label: string; tone: string }> = {
  PENDING_PAYMENT: { label: "بانتظار الدفع", tone: "amber" },
  PAYMENT_REVIEW: { label: "مراجعة الدفع", tone: "sky" },
  CONFIRMED: { label: "مؤكد — بانتظار البدء", tone: "violet" },
  IN_PROGRESS: { label: "قيد الصعود", tone: "cyan" },
  COMPLETED: { label: "وصل القمة", tone: "gold" },
  CANCELLED: { label: "ملغى", tone: "rose" },
};

// How the guardian gets into the account. QR is the only method offered now;
// LOGIN / DUO remain only for older bookings.
export const MODES: Record<string, string> = { QR: "دخول عبر QR", LOGIN: "دخول بكلمة المرور", DUO: "اللعب معاً" };

// A booking holds a slot unless it is cancelled, or unpaid with no proof after 24h.
export const HOLD_MS = 24 * 3600 * 1000;
export function slotWhere(playerId: string, seasonId: string) {
  return {
    playerId,
    seasonId,
    status: { not: "CANCELLED" },
    NOT: { status: "PENDING_PAYMENT", createdAt: { lt: new Date(Date.now() - HOLD_MS) } },
  };
}

export async function activeSeason() {
  return db.season.findFirst({ where: { active: true }, orderBy: { startsAt: "desc" } });
}

export async function takenSlots(seasonId: string | undefined) {
  if (!seasonId) return new Map<string, number>();
  const rows = await db.booking.groupBy({
    by: ["playerId"],
    _count: true,
    where: {
      seasonId,
      status: { not: "CANCELLED" },
      NOT: { status: "PENDING_PAYMENT", createdAt: { lt: new Date(Date.now() - HOLD_MS) } },
    },
  });
  return new Map(rows.map((r) => [r.playerId, r._count]));
}

// Average rating and count of visible reviews, per player.
export async function ratings() {
  const rows = await db.review.groupBy({ by: ["playerId"], where: { hidden: false }, _avg: { rating: true }, _count: true });
  return new Map(rows.map((r) => [r.playerId, { avg: r._avg.rating ?? 0, count: r._count }]));
}

// Shows only the first name of a reviewer, for privacy.
export const reviewerName = (name: string) => name.trim().split(/\s+/)[0] || "عميل";

export async function settings() {
  const rows = await db.setting.findMany();
  return Object.fromEntries(rows.map((r) => [r.key, r.value])) as Record<string, string>;
}

export function trustScore(p: { idVerified: boolean; cleanRecord: boolean; gameplayReview: boolean; pledgeSigned: boolean }) {
  return [p.idVerified, p.cleanRecord, p.gameplayReview, p.pledgeSigned].filter(Boolean).length;
}

// What the provider still has to fill in before the admin can publish the card.
export function missingCardFields(p: { title: string; country: string; device: string; experienceYrs: number }, services: number) {
  return [
    !p.title && "الوصف القصير",
    !p.country && "البلد",
    !p.device && "نوع الجهاز",
    !p.experienceYrs && "سنوات الخبرة",
    !services && "سعر نوع رانك واحد على الأقل",
  ].filter(Boolean) as string[];
}

// Customers' game credentials: AES-256-GCM with CRED_KEY.
function key() {
  const k = Buffer.from(process.env.CRED_KEY || "", "base64");
  if (k.length !== 32) throw new Error("CRED_KEY must be 32 bytes base64");
  return k;
}
export function encrypt(text: string) {
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([c.update(text, "utf8"), c.final()]);
  return [iv, c.getAuthTag(), data].map((b) => b.toString("base64")).join(".");
}
export function decrypt(blob: string) {
  const [iv, tag, data] = blob.split(".").map((s) => Buffer.from(s, "base64"));
  const d = createDecipheriv("aes-256-gcm", key(), iv);
  d.setAuthTag(tag);
  return Buffer.concat([d.update(data), d.final()]).toString("utf8");
}

export const money = (n: number) => `$${n.toLocaleString("en-US")}`;
export const fmtDate = (d: Date) => d.toLocaleDateString("ar-EG", { day: "numeric", month: "long", year: "numeric" });
