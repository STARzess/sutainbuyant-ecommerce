import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteNavigation, NavigationLinks } from "@/components/site-navigation";
import { Suspense } from "react";
import { CartLink, HeaderCartLink } from "@/components/cart-link";
import { AccountLink, AccountLinkFallback } from "@/components/account-link";
import "./globals.css";
import "./forms.css";

export const metadata: Metadata = {
  title: "Сутайн Буянт | Онлайн дэлгүүр",
  description:
    "Сутайн Буянт онлайн дэлгүүр. Өдөр тутмын хэрэгцээт бараа, бүтээгдэхүүнийг ангилал, үнээр сонгоорой.",
  openGraph: {
    title: "Сутайн Буянт | Онлайн дэлгүүр",
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
            <Suspense fallback={<NavigationLinks />}>
              <SiteNavigation />
            </Suspense>
            <div className="header-actions">
              <Suspense fallback={<CartLink />}><HeaderCartLink /></Suspense>
              <Suspense fallback={<AccountLinkFallback />}>
                <AccountLink />
              </Suspense>
            </div>
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
              <p>Бараа, бүтээгдэхүүний онлайн дэлгүүр.</p>
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
