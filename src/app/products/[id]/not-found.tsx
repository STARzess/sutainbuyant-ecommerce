import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="container detail-page">
      <div className="catalog-empty">
        <h1>Бүтээгдэхүүн олдсонгүй</h1>
        <p>Энэ бүтээгдэхүүний мэдээлэл байхгүй байна.</p>
        <Link className="button primary" href="/products">
          Бүтээгдэхүүнүүдийг харах
        </Link>
      </div>
    </div>
  );
}
