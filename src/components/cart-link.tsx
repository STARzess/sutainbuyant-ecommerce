"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/lib/cart-store";

export function CartLink({ active = false }: { active?: boolean }) {
  const { items } = useCart();
  const quantity = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <Link
      className="header-cart-link"
      href="/cart" prefetch={false}
      aria-current={active ? "page" : undefined}
      aria-label={quantity ? `Сагс, ${quantity} ширхэг бүтээгдэхүүн` : "Сагс"}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
        <path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2" />
      </svg>
      <span className="header-cart-text">Сагс</span>
      {quantity > 0 && <span className="header-cart-count" aria-hidden="true">{quantity}</span>}
    </Link>
  );
}

export function HeaderCartLink() {
  const pathname = usePathname();
  return <CartLink active={pathname === "/cart"} />;
}
