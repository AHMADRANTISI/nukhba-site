import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import SkyCanvas from "@/components/SkyCanvas";
import { AltitudeGauge, MotionRuntime } from "@/components/Motion";
import { getUser } from "@/lib/auth";
import { settings } from "@/lib/core";
import { logout } from "./actions";
import Logo from "@/components/Logo";

// One clear typeface everywhere: Cairo — bold for headings, regular for text.
const kufi = Cairo({ subsets: ["arabic", "latin"], weight: ["600", "700", "800"], variable: "--font-kufi" });
const plex = Cairo({ subsets: ["arabic", "latin"], weight: ["400", "500", "700"], variable: "--font-plex" });

export const metadata: Metadata = {
  title: "نخبة | NUKHBA — نخبة لاعبي الكونكر",
  description: "احجز لاعباً محترفاً موثّقاً لرفع حسابك إلى كونكر ألتميت أو كونكر كلاسيك — لعب نظيف بدون غش وحسابك بأمان.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [user, s] = await Promise.all([getUser(), settings()]);
  return (
    <html lang="ar" dir="rtl" className={`${kufi.variable} ${plex.variable}`}>
      <body className="min-h-dvh">
        <SkyCanvas />
        <MotionRuntime />
        <AltitudeGauge />

        <header className="sticky top-0 z-40 border-b border-white/5 bg-night/60 backdrop-blur-md">
          <nav className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3">
            <Link href="/" aria-label="نخبة — الصفحة الرئيسية">
              <Logo size={40} />
            </Link>
            <div className="ms-auto flex items-center gap-1 text-sm sm:gap-4">
              <Link href="/players" className="px-2 py-1 text-mist hover:text-white">اللاعبين</Link>
              <Link href="/#trust" className="hidden px-2 py-1 text-mist hover:text-white sm:inline">الأمان</Link>
              {user ? (
                <>
                  {user.role === "ADMIN" && <Link href="/admin" className="px-2 py-1 text-gold">الإدارة</Link>}
                  <Link href="/me" className="px-2 py-1 text-ice">حجوزاتي</Link>
                  <form action={logout}><button className="px-2 py-1 text-mist/70 hover:text-rose">خروج</button></form>
                </>
              ) : (
                <Link href="/login" className="btn-ghost !px-4 !py-1.5 text-sm">دخول</Link>
              )}
            </div>
          </nav>
        </header>

        <main>{children}</main>

        <footer className="relative mt-24 border-t border-white/5 bg-night/80">
          <div className="mx-auto grid max-w-6xl gap-6 px-4 py-10 text-sm text-mist sm:grid-cols-3">
            <div>
              <Logo size={34} />
              <p className="mt-2 leading-7">منظومة لتنظيم اللاعبين المحترفين الموثّقين. لا غش، لا برامج خارجية، حسابك بأمان.</p>
            </div>
            <div className="space-y-2">
              <Link href="/players" className="block hover:text-white">كل اللاعبين</Link>
              <Link href="/#how" className="block hover:text-white">طريقة الحجز</Link>
              <Link href="/#faq" className="block hover:text-white">الأسئلة الشائعة</Link>
            </div>
            <div className="space-y-2">
              {s.whatsapp && <a className="block hover:text-white" href={`https://wa.me/${s.whatsapp.replace(/\D/g, "")}`}>واتساب</a>}
              {s.telegram && <a className="block hover:text-white" href={`https://t.me/${s.telegram.replace(/^@/, "")}`}>تيليجرام</a>}
              <p className="text-xs text-mist/50">موقع مستقل غير تابع لأي شركة ألعاب.</p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
