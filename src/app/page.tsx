import { PartsArt } from "@/components/parts-art";
import Link from "next/link";
import { catalogCategories } from "@/lib/catalog";
import { homeProducts, homeCategories, formatPrice } from "@/lib/home-products";

export default function HomePage() {
  return (
    <div className="container home-page">
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="hero-eyebrow">
            <span /> Автомашины сэлбэгийн дэлгүүр
          </p>
          <h1 id="hero-title">
            Таны автомашинд
            <br />
            хэрэгтэй <em>сэлбэг.</em>
          </h1>
          <p className="hero-description">
            Хөдөлгүүр, явах эд анги, тоормос, дугуй болон дагалдах хэрэгслийг
            нэг дороос.
          </p>
          <div className="hero-actions">
            <Link className="button primary" href="/products">
              Сэлбэгүүд харах <span aria-hidden="true">↗</span>
            </Link>
            <a className="hero-secondary" href="#categories">
              Ангилал харах <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>
        <div className="hero-art">
          <div className="hero-orbit orbit-one" />
          <div className="hero-orbit orbit-two" />
          <div className="hero-grid" />
          <span className="hero-art-label">СУТАЙН БУЯНТ / АВТО СЭЛБЭГ</span>
          <PartsArt kind="brake" name="Тоормосны диск" className="hero-brake" />
          <PartsArt kind="oil" name="Хөдөлгүүрийн тос" className="hero-oil" />
          <PartsArt kind="tire" name="Автомашины дугуй" className="hero-tire" />
          <span className="hero-art-line" />
        </div>
      </section>

      <section
        id="categories"
        className="categories-section"
        aria-labelledby="categories-title"
      >
        <div className="section-heading">
          <div>
            <h2 id="categories-title">Сэлбэгийн ангилал</h2>
          </div>
          <span className="section-caption">Автомашины үндсэн эд ангиуд</span>
        </div>
        <div className="category-grid">
          {homeCategories.map((category) => (
            <Link
              className="category-card"
              key={category.name}
              href={`/products?category=${catalogCategories.find((item) => item.name === category.name)!.id}&sort=newest`}
            >
              <PartsArt kind={category.kind} name={category.name} />
              <div>
                <h3>{category.name}</h3>
                <p>{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="new-arrivals"
        className="products-section"
        aria-labelledby="products-title"
      >
        <div className="section-heading">
          <div>
            <p className="eyebrow">Бүтээгдэхүүн</p>
            <h2 id="products-title">Шинээр нэмэгдсэн сэлбэг</h2>
          </div>
          <Link className="section-link" href="/products?sort=newest">
            Бүгдийг харах <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className="product-grid">
          {homeProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <Link className="product-card-link" href={`/products/${product.id}`}>
              <div className="product-image">
                <PartsArt kind={product.kind} name={product.name} />
              </div>
              <div className="product-content">
                <p className="product-category">{product.category}</p>
                <h3>{product.name}</h3>
                <p className="product-label">{product.label}</p>
                <p className="product-price">{formatPrice(product.price)}</p>
              </div>
              </Link>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
