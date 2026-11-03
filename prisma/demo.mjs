// Demo data for showing the site "as a logged-in customer": one demo customer with
// bookings in every stage, plus a few completed bookings with reviews on each player.
// Remove with `npm run demo:clear` before launch.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();
const DEMO = "@demo.qimma.test";

if (process.argv.includes("--clear")) {
  const users = await db.user.findMany({ where: { email: { endsWith: DEMO } }, select: { id: true } });
  const ids = users.map((u) => u.id);
  await db.review.deleteMany({ where: { userId: { in: ids } } });
  await db.booking.deleteMany({ where: { userId: { in: ids } } });
  await db.user.deleteMany({ where: { id: { in: ids } } });
  console.log(`Removed ${ids.length} demo users and their data.`);
  process.exit(0);
}

const password = process.env.DEMO_PASSWORD;
if (!password) throw new Error("DEMO_PASSWORD is missing in .env");

const season = await db.season.findFirst({ where: { active: true } });
const players = Object.fromEntries((await db.player.findMany({ include: { services: true } })).map((p) => [p.slug, p]));
const hash = await bcrypt.hash(password, 10);
let n = 0;

async function user(name, local) {
  const email = local + DEMO;
  return (await db.user.findUnique({ where: { email } })) ??
    db.user.create({ data: { name, email, phone: "+900000000000", passwordHash: hash } });
}

async function booking(u, slug, service, status, extra = {}, events = []) {
  const p = players[slug];
  const svc = p.services.find((s) => s.service === service);
  const ago = (d) => new Date(Date.now() - d * 864e5);
  return db.booking.create({
    data: {
      code: `D-${(Date.now() % 1e6).toString(36).toUpperCase()}${n++}`,
      userId: u.id, playerId: p.id, seasonId: season.id, service, price: svc.price, status,
      mode: "QR", gameName: "DemoHero", gameId: "5123456789", server: "الشرق الأوسط", contact: "+900000000000",
      createdAt: ago(extra.daysAgo ?? 3), progress: extra.progress ?? 0, adminNote: extra.note ?? "",
      events: { create: events.map((text, i) => ({ text, createdAt: ago((extra.daysAgo ?? 3) - i * 0.6) })) },
    },
  });
}

// ── the demo customer you log in as ──
const me = await user("أحمد", "customer");
if (!(await db.booking.count({ where: { userId: me.id } }))) {
  const done = await booking(me, "nimr", "CLASSIC", "COMPLETED", { daysAgo: 12, progress: 100 },
    ["تم حجز المقعد — بانتظار إثبات الدفع خلال 24 ساعة", "تم رفع إثبات الدفع — قيد المراجعة", "الحالة: مؤكد — بانتظار البدء", "الحالة: قيد الصعود", "وصل إيس دومينيتور", "الحالة: وصل القمة"]);
  await db.review.create({ data: { bookingId: done.id, playerId: done.playerId, userId: me.id, rating: 5, text: "وصلني كونكر قبل الموعد بيومين، وكان يرسل لي تحديثات كل يوم. لعب نظيف 100%." } });
  await booking(me, "saqr", "ULTIMATE", "IN_PROGRESS", { daysAgo: 4, progress: 62, note: "اللاعب يلعب يومياً من 8 مساءً حتى 2 فجراً" },
    ["تم حجز المقعد — بانتظار إثبات الدفع خلال 24 ساعة", "تم رفع إثبات الدفع — قيد المراجعة", "الحالة: مؤكد — بانتظار البدء", "الحالة: قيد الصعود", "التقدّم 62%"]);
  await booking(me, "rawan", "ULTIMATE", "PENDING_PAYMENT", { daysAgo: 0.1 }, ["تم حجز المقعد — بانتظار إثبات الدفع خلال 24 ساعة"]);
  await booking(me, "dhib", "CLASSIC", "COMPLETED", { daysAgo: 20, progress: 100 },
    ["تم حجز المقعد — بانتظار إثبات الدفع خلال 24 ساعة", "الحالة: قيد الصعود", "الحالة: وصل القمة"]);
}

// ── other customers' reviews so the profiles look alive ──
const sample = [
  ["خالد", "nimr", "ULTIMATE", 5, "محترف جداً وهادئ، ما خسرت أي نقاط تقريباً."],
  ["يوسف", "nimr", "CLASSIC", 4, "ممتاز، تأخر يوم واحد بس بسبب ضغط الموسم."],
  ["ريم", "saqr", "CLASSIC", 5, "أسرع لاعب جربته، وتعامله راقي."],
  ["عمر", "saqr", "ULTIMATE", 5, "وصلت كونكر ألتميت لأول مرة بحياتي. شكراً!"],
  ["مازن", "rawan", "ULTIMATE", 5, "استراتيجيتها بالدائرة الأخيرة شي ثاني."],
  ["سارة", "rawan", "CLASSIC", 4, "تجربة جميلة وتواصل مستمر."],
  ["حسن", "dhib", "CLASSIC", 5, "هادئ ومحترف، وصلني بدون أي خسارة نقاط."],
  ["علي", "dhib", "CLASSIC", 3, "وصلت الكونكر لكن أخذ وقت أطول من المتوقع."],
];
for (const [i, [name, slug, service, rating, text]] of sample.entries()) {
  const u = await user(name, `reviewer${i}`);
  if (await db.review.count({ where: { userId: u.id } })) continue;
  if (!players[slug].services.some((s) => s.service === service)) continue;
  const b = await booking(u, slug, service, "COMPLETED", { daysAgo: 30 + i * 3, progress: 100 }, ["الحالة: وصل القمة"]);
  await db.review.create({ data: { bookingId: b.id, playerId: b.playerId, userId: u.id, rating, text, createdAt: new Date(Date.now() - (25 + i * 3) * 864e5) } });
}

console.log("Demo ready: customer" + DEMO);
await db.$disconnect();
