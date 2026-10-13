import type { Metadata } from "next";
import Link from "next/link";
import "./not-found.css";

export const metadata: Metadata = {
  title: "Хуудас олдсонгүй | Сутайн Буянт",
  description: "Таны хайсан хуудас олдсонгүй. Нүүр хуудас эсвэл бүтээгдэхүүний жагсаалтаас хайлтаа үргэлжлүүлээрэй.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <section className="container not-found-page" aria-labelledby="not-found-title">
      <p className="not-found-code" aria-hidden="true">404</p>
      <h1 id="not-found-title">Хуудас олдсонгүй</h1>
      <p>Таны хайсан хуудас байхгүй эсвэл хаяг нь өөрчлөгдсөн байна.</p>
      <div className="not-found-actions">
        <Link className="button primary" href="/">Нүүр хуудас</Link>
        <Link className="button" href="/products">Бүтээгдэхүүн үзэх</Link>
      </div>
    </section>
  );
}
