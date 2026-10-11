"use client";

import Link from "next/link";
import { CartLink } from "@/components/cart-link";
import { usePathname } from "next/navigation";

export function NavigationLinks({ pathname = "", accountLink }: { pathname?: string; accountLink?: React.ReactNode }) {
  return (
    <nav aria-label="Үндсэн цэс">
      <Link href="/" aria-current={pathname === "/" ? "page" : undefined}>
        Нүүр
      </Link>
      <Link
        href="/products"
        aria-current={pathname === "/products" || pathname.startsWith("/products/") ? "page" : undefined}
      >
        Бүтээгдэхүүн
      </Link>
      <Link href="/#categories">Ангилал</Link>
      <CartLink active={pathname === "/cart"} />
      {accountLink}
    </nav>
  );
}

export function SiteNavigation({ accountLink }: { accountLink?: React.ReactNode }) {
  const pathname = usePathname();
  return <NavigationLinks pathname={pathname} accountLink={accountLink} />;
}
