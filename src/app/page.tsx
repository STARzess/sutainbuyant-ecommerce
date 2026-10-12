import Link from "next/link";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductImage } from "@/components/product-image";
import { formatPrice } from "@/lib/home-products";
import { defaultShopQuery, getShopOptions, getShopProducts } from "@/lib/shop-api";

async function HomeContent() {
  const [options, arrivals] = await Promise.all([getShopOptions(), getShopProducts(defaultShopQuery, 8)]);
  return (
    <div className="container home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-eyebrow"><span /> Сутайн Буянт онлайн дэлгүүр</p>
          <h1 id="hero-title">Өдөр тутмын<br />хэрэгцээт <em>бүтээгдэхүүн.</em></h1>
          <p className="hero-description">Өөрт хэрэгтэй бараагаа нэг дороос сонгоорой.</p>
          <div className="hero-actions">
            <Link className="button primary" href="/products">Бүтээгдэхүүн үзэх </Link>
            <a className="hero-secondary" href="#categories">Ангилал харах </a>
          </div>
        </div>
        <div className="hero-art shop-hero-art">
          <div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-grid" />
          <span className="hero-art-label">СУТАЙН БУЯНТ / ОНЛАЙН ДЭЛГҮҮР</span>
          {arrivals.products.slice(0, 2).map((product, index) => (
            <Link className={`hero-feature hero-feature-${index + 1}`} key={product.id} href={`/products/${product.id}`}>
              <div className="hero-feature-image"><ProductImage product={product} priority /></div>
              <p>{product.name}</p><strong>{formatPrice(product.price)}</strong>
            </Link>
          ))}
          <span className="hero-art-line" />
        </div>
      </section>

      <section id="categories" className="categories-section" aria-labelledby="categories-title">
        <div className="section-heading">
          <div><h2 id="categories-title">Бүтээгдэхүүний ангилал</h2></div>
          <span className="section-caption">Өдөр тутмын хэрэгцээт бараа</span>
        </div>
        <div className="category-grid">
          {options.categories.map((category) => (
            <Link className="category-card shop-category-card" key={category.id} href={`/products?category=${category.id}&sort=newest`}>
              <div className="category-photo"><ProductImage product={{ name: category.name, image: category.image }} size="cart" /></div>
              <div><h3>{category.name}</h3><p>{category.description}</p></div>
            </Link>
          ))}
        </div>
      </section>

      <section id="new-arrivals" className="products-section" aria-labelledby="products-title">
        <div className="section-heading">
          <div><p className="eyebrow">Бүтээгдэхүүн</p><h2 id="products-title">Шинээр нэмэгдсэн бүтээгдэхүүн</h2></div>
          <Link className="section-link" href="/products?sort=newest">Бүгдийг харах </Link>
        </div>
        <div className="product-grid">{arrivals.products.map((product) => <ProductCard key={product.id} product={product} />)}</div>
      </section>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="container shop-home-loading" role="status" aria-label="Бүтээгдэхүүнүүдийг ачаалж байна"><div className="skeleton-card" /><div className="skeleton-search" /></div>}>
      <HomeContent />
    </Suspense>
  );
}
