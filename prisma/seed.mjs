// Seeds the admin account, the active season, payment methods, settings and demo players.
// Demo players are fictional placeholders — replace them from the admin panel.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const email = process.env.ADMIN_EMAIL || "admin@qimma.test";
const password = process.env.ADMIN_PASSWORD;
if (!password) throw new Error("ADMIN_PASSWORD is missing in .env");

await db.user.upsert({
  where: { email },
  update: {},
  create: { name: "الإدارة", email, phone: "", role: "ADMIN", passwordHash: await bcrypt.hash(password, 10) },
});

if (!(await db.season.findFirst())) {
  const now = new Date();
  await db.season.create({
    data: { name: "الموسم الحالي", startsAt: now, endsAt: new Date(now.getTime() + 60 * 864e5), active: true },
  });
}

if (!(await db.paymentMethod.count())) {
  await db.paymentMethod.createMany({
    data: [
      { name: "USDT (TRC20)", details: "ضع عنوان المحفظة هنا", sort: 1 },
      { name: "تحويل بنكي", details: "اسم البنك — IBAN — اسم المستفيد", sort: 2 },
    ],
  });
}

const settings = { whatsapp: "", telegram: "", siteName: "نخبة" };
for (const [key, value] of Object.entries(settings)) {
  await db.setting.upsert({ where: { key }, update: {}, create: { key, value } });
}

const demo = [
  { slug: "nimr", name: "NIMR", title: "صيّاد الكونكر الهادئ", country: "الأردن", classicConqs: 9, ultimateConqs: 4, metroTier: "النخبة 5", kd: 7.4, winRate: 31, experienceYrs: 6, device: "iPad Pro", prices: [45, 60, 35] },
  { slug: "saqr", name: "SAQR", title: "قائد الرش السريع", country: "السعودية", classicConqs: 12, ultimateConqs: 2, metroTier: "النخبة 3", kd: 9.1, winRate: 38, experienceYrs: 7, device: "iPhone 16 Pro Max", prices: [55, 70, 40] },
  { slug: "rawan", name: "RAWAN", title: "استراتيجية الدائرة الأخيرة", country: "مصر", classicConqs: 6, ultimateConqs: 7, metroTier: "النخبة 4", kd: 6.2, winRate: 29, experienceYrs: 5, device: "iPad Air", prices: [40, 65, 30] },
  { slug: "dhib", name: "DHIB", title: "متخصص مترو رويال", country: "العراق", classicConqs: 4, ultimateConqs: 1, metroTier: "النخبة 6", kd: 5.8, winRate: 24, experienceYrs: 4, device: "ROG Phone 9", prices: [35, 0, 50] },
];

for (const [i, p] of demo.entries()) {
  if (await db.player.findUnique({ where: { slug: p.slug } })) continue;
  const { prices, ...data } = p;
  await db.player.create({
    data: {
      ...data,
      sort: i,
      completedBase: 60 + i * 35,
      bio: "لاعب تجريبي — عدّل بياناته أو احذفه من لوحة الإدارة.",
      achievements: "كونكر في عدة مواسم متتالية\nبدون أي حظر أو إنذار على الحساب",
      idVerified: true, cleanRecord: true, gameplayReview: true, pledgeSigned: true, verifiedAt: new Date(),
      services: {
        create: ["CLASSIC", "ULTIMATE"]
          .map((service, k) => ({ service, price: prices[k], days: [7, 10, 5][k] }))
          .filter((s) => s.price > 0),
      },
    },
  });
}

console.log("Seeded. Admin:", email);
await db.$disconnect();
