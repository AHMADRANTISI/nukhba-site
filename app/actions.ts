"use server";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { z } from "zod";
import { createSession, destroySession, requireUser } from "@/lib/auth";
import { activeSeason, db, encrypt, SERVICE_KEYS, slotWhere } from "@/lib/core";
import { saveImage } from "@/lib/upload";

export type FormState = { error?: string; ok?: boolean } | null;

const safeNext = (n: unknown) => (typeof n === "string" && n.startsWith("/") && !n.startsWith("//") ? n : "/me");

export async function register(_: FormState, f: FormData): Promise<FormState> {
  const r = z.object({
    name: z.string().trim().min(2, "الاسم قصير"),
    email: z.string().trim().toLowerCase().email("بريد غير صالح"),
    phone: z.string().trim().min(6, "رقم واتساب غير صالح"),
    password: z.string().min(8, "كلمة المرور 8 أحرف على الأقل"),
  }).safeParse(Object.fromEntries(f));
  if (!r.success) return { error: r.error.issues[0].message };
  if (await db.user.findUnique({ where: { email: r.data.email } })) return { error: "هذا البريد مسجّل مسبقاً" };
  const { password, ...data } = r.data;
  const u = await db.user.create({ data: { ...data, passwordHash: await bcrypt.hash(password, 10) } });
  await createSession(u.id);
  redirect(safeNext(f.get("next")));
}

export async function login(_: FormState, f: FormData): Promise<FormState> {
  const email = String(f.get("email") || "").trim().toLowerCase();
  const u = await db.user.findUnique({ where: { email } });
  if (!u || !(await bcrypt.compare(String(f.get("password") || ""), u.passwordHash))) return { error: "البريد أو كلمة المرور غير صحيحة" };
  await createSession(u.id);
  redirect(safeNext(f.get("next") || (u.role === "ADMIN" ? "/admin" : "/me")));
}

export async function logout() {
  await destroySession();
  redirect("/");
}

export async function book(_: FormState, f: FormData): Promise<FormState> {
  const slug = String(f.get("slug"));
  const user = await requireUser(`/players/${slug}`);
  const r = z.object({
    service: z.enum(SERVICE_KEYS as [string, ...string[]]),
    mode: z.enum(["LOGIN", "DUO"]),
    gameName: z.string().trim().min(2, "اكتب اسمك في اللعبة"),
    gameId: z.string().trim().regex(/^\d{5,15}$/, "الـ ID أرقام فقط"),
    server: z.string().trim().min(2),
    contact: z.string().trim().min(6, "اكتب رقم واتساب أو معرف تيليجرام"),
    notes: z.string().trim().max(600).optional().default(""),
    loginType: z.string().optional(),
    loginUser: z.string().optional(),
    loginPass: z.string().optional(),
    agree: z.literal("on", { errorMap: () => ({ message: "يجب الموافقة على ميثاق الحجز" }) }),
  }).safeParse(Object.fromEntries(f));
  if (!r.success) return { error: r.error.issues[0].message };
  const d = r.data;
  if (d.mode === "LOGIN" && (!d.loginType || !d.loginUser || !d.loginPass)) return { error: "أكمل بيانات دخول الحساب أو اختر اللعب مع الحارس" };

  const season = await activeSeason();
  if (!season) return { error: "لا يوجد موسم مفتوح للحجز حالياً" };
  const player = await db.player.findUnique({ where: { slug }, include: { services: true } });
  const svc = player?.services.find((s) => s.service === d.service && s.enabled);
  if (!player || !player.active || !svc) return { error: "هذه الخدمة غير متاحة لدى هذا الحارس" };

  const code = "Q-" + randomBytes(3).toString("hex").toUpperCase();
  try {
    await db.$transaction(async (tx) => {
      const used = await tx.booking.count({ where: slotWhere(player.id, season.id) });
      if (used >= player.slotsPerSeason) throw new Error("FULL");
      await tx.booking.create({
        data: {
          code, userId: user.id, playerId: player.id, seasonId: season.id, service: d.service, price: svc.price, mode: d.mode,
          gameName: d.gameName, gameId: d.gameId, server: d.server, contact: d.contact, notes: d.notes,
          loginType: d.mode === "LOGIN" ? d.loginType : null,
          credentials: d.mode === "LOGIN" ? encrypt(JSON.stringify({ user: d.loginUser, pass: d.loginPass })) : null,
          events: { create: { text: "تم حجز المقعد — بانتظار إثبات الدفع خلال 24 ساعة" } },
        },
      });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "FULL") return { error: "للأسف اكتملت مقاعد هذا الحارس لهذا الموسم" };
    throw e;
  }
  redirect(`/me/${code}`);
}

export async function uploadProof(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser();
  const b = await db.booking.findUnique({ where: { code: String(f.get("code")) } });
  if (!b || b.userId !== user.id) return { error: "الحجز غير موجود" };
  if (!["PENDING_PAYMENT", "PAYMENT_REVIEW"].includes(b.status)) return { error: "لا يمكن رفع إثبات لهذا الحجز الآن" };
  try {
    const name = await saveImage(f.get("proof") as File, "proofs", b.code);
    if (!name) return { error: "اختر صورة إثبات الدفع" };
    await db.booking.update({
      where: { id: b.id },
      data: { proofFile: name, status: "PAYMENT_REVIEW", events: { create: { text: "تم رفع إثبات الدفع — قيد المراجعة" } } },
    });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "تعذّر رفع الملف" };
  }
  revalidatePath(`/me/${b.code}`);
  return null;
}

export async function cancelMyBooking(f: FormData) {
  const user = await requireUser();
  const b = await db.booking.findUnique({ where: { code: String(f.get("code")) } });
  if (!b || b.userId !== user.id || b.status !== "PENDING_PAYMENT") return;
  await db.booking.update({
    where: { id: b.id },
    data: { status: "CANCELLED", credentials: null, events: { create: { text: "ألغى العميل الحجز — تم مسح بيانات الحساب" } } },
  });
  revalidatePath(`/me/${b.code}`);
}

// Only the customer of a COMPLETED booking can rate; re-submitting edits the same review.
export async function submitReview(_: FormState, f: FormData): Promise<FormState> {
  const user = await requireUser();
  const r = z.object({
    code: z.string(),
    rating: z.coerce.number().int().min(1, "اختر عدد النجوم").max(5),
    text: z.string().trim().max(800, "التقييم طويل جداً (800 حرف كحد أقصى)").optional().default(""),
  }).safeParse(Object.fromEntries(f));
  if (!r.success) return { error: r.error.issues[0].message };
  const b = await db.booking.findUnique({ where: { code: r.data.code } });
  if (!b || b.userId !== user.id) return { error: "الحجز غير موجود" };
  if (b.status !== "COMPLETED") return { error: "يمكنك التقييم بعد إنجاز الحساب فقط" };
  const { rating, text } = r.data;
  await db.review.upsert({
    where: { bookingId: b.id },
    update: { rating, text },
    create: { bookingId: b.id, playerId: b.playerId, userId: user.id, rating, text },
  });
  revalidatePath(`/me/${b.code}`);
  revalidatePath("/", "layout");
  return { ok: true };
}
