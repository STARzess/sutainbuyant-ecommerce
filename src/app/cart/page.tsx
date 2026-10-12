import type { Metadata } from "next";
import Link from "next/link";
import { CartView } from "@/components/cart-view";
import "./cart.css";

export const metadata: Metadata = {
  title: "Миний сагс | Сутайн Буянт",
  description: "Сонгосон бүтээгдэхүүний тоо ширхэг, үнийн дүнг харах.",
  robots: { index: false, follow: false },
};

export default function CartPage() {
  return (
    <div className="container cart-page">
      <nav className="breadcrumb" aria-label="Хуудасны зам">
        <Link href="/">Нүүр</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">Сагс</span>
      </nav>
      <header className="cart-heading">
        <div>
          <p className="cart-eyebrow">СОНГОСОН БҮТЭЭГДЭХҮҮНҮҮД</p>
          <h1>Миний сагс</h1>
        </div>
        <Link className="cart-continue" href="/products">
           Үргэлжлүүлэн сонгох
        </Link>
      </header>
      <CartView />
    </div>
  );
}
