import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNavigation } from "@/components/site-navigation";
import "./globals.css";

export const metadata: Metadata = {
  title: "Сутайн Буянт | Автомашины сэлбэг",
  description:
    "Автомашины хөдөлгүүр, тоормос, явах эд анги, тос тосолгоо, дугуй болон дагалдах хэрэгсэл. Сутайн Буянт авто сэлбэгийн дэлгүүр.",
  openGraph: {
    title: "Сутайн Буянт | Автомашины сэлбэг",
    locale: "mn_MN",
    siteName: "Сутайн Буянт",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="mn">
      <body>
        <a className="skip-link" href="#main">
          Үндсэн агуулга руу очих
        </a>
        <header className="site-header">
          <div className="container header-inner">
            <Link
              className="brand"
              href="/"
              aria-label="Сутайн Буянт — Нүүр хуудас"
            >
              <Image
                src="/company-logo.png"
                alt="Сутайн Буянт"
                width={175}
                height={45}
                priority
              />
            </Link>
            <SiteNavigation />
            <a className="header-phone" href="tel:+97677669999">
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
              >
                <path d="M7 3h3l2 5-3 2c1 3 3 5 6 6l2-3 5 2v3c0 2-1 3-3 3C9 21 3 15 3 6c0-2 2-3 4-3Z" />
              </svg>
              7766 9999
            </a>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="container footer-inner">
            <div>
              <a
                href="https://sutainbuyant.com/"
                className="footer-brand"
                target="_blank"
                rel="noopener noreferrer"
              >
                Сутайн Буянт
              </a>
              <p>Автомашины сэлбэг, дагалдах хэрэгсэл.</p>
            </div>
            <div className="footer-contact">
              <a href="mailto:info@sutainbuyant.com">info@sutainbuyant.com</a>
              <a href="tel:+97677669999">7766 9999</a>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
