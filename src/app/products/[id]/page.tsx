import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCart } from "@/components/add-to-cart";
import { PartsArt } from "@/components/parts-art";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { catalogProducts } from "@/lib/catalog-products";
import {
  catalogCategories,
  catalogTags,
  type CatalogProduct,
  type SearchParams,
} from "@/lib/catalog";
import { formatPrice } from "@/lib/home-products";
import {
  getCatalogReturnHref,
  getProductDescription,
  getRelatedProducts,
} from "@/lib/product-details";
import "./product-detail.css";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
};

function getProduct(id: string) {
  const product = catalogProducts.find((item) => item.id === id);
  if (!product) notFound();
  return product;
}

export function generateStaticParams() {
  return catalogProducts.map((product) => ({ id: product.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = getProduct((await params).id);
  const title = `${product.name} — ${product.label} | Сутайн Буянт`;
  const description = `${product.name}. ${product.label}. Код: ${product.sku}. Үнэ: ${formatPrice(product.price)}. ${getProductDescription(product)}`;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "mn_MN",
      siteName: "Сутайн Буянт",
    },
    twitter: { card: "summary", title, description },
  };
}

async function ReturnLink({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const href = getCatalogReturnHref((await searchParams).from);
  return (
    <Link href={href} className="detail-return">
      <span aria-hidden="true">←</span>Жагсаалт руу буцах
    </Link>
  );
}

function RelatedGrid({
  product,
  returnTo,
}: {
  product: CatalogProduct;
  returnTo?: string;
}) {
  const related = getRelatedProducts(product, catalogProducts);
  if (!related.length) return null;
  return (
    <section className="detail-related" aria-labelledby="related-title">
      <div className="section-heading">
        <h2 id="related-title">Холбоотой сэлбэгүүд</h2>
        <Link className="section-link" href="/products">
          Бүгдийг харах <span aria-hidden="true">→</span>
        </Link>
      </div>
      <div className="product-grid">
        {related.map((item) => (
          <ProductCard key={item.id} product={item} returnTo={returnTo} />
        ))}
      </div>
    </section>
  );
}

async function RelatedProducts({
  product,
  searchParams,
}: {
  product: CatalogProduct;
  searchParams: Promise<SearchParams>;
}) {
  return (
    <RelatedGrid
      product={product}
      returnTo={getCatalogReturnHref((await searchParams).from)}
    />
  );
}

function RelatedSkeleton() {
  return (
    <section
      className="detail-related"
      aria-label="Холбоотой сэлбэгүүдийг ачаалж байна"
    >
      <div className="section-heading">
        <h2>Холбоотой сэлбэгүүд</h2>
      </div>
      <div className="product-grid" aria-hidden="true">
        {Array.from({ length: 4 }, (_, index) => (
          <div key={index} className="skeleton-card" />
        ))}
      </div>
    </section>
  );
}

export default async function ProductPage({ params, searchParams }: Props) {
  const product = getProduct((await params).id);
  const category = catalogCategories.find(
    (item) => item.name === product.category,
  );
  const specs = [
    ["Бүтээгдэхүүний код", product.sku],
    ["Ангилал", product.category],
    ["Загвар / Үзүүлэлт", product.label],
  ];
  return (
    <div className="container detail-page">
      <nav className="breadcrumb detail-breadcrumb" aria-label="Хуудасны зам">
        <Link href="/">Нүүр</Link>
        <span aria-hidden="true">/</span>
        <Link href="/products">Бүтээгдэхүүн</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{product.name}</span>
      </nav>
      <Suspense
        fallback={
          <span className="detail-return" aria-hidden="true">
            <span>←</span>Жагсаалт руу буцах
          </span>
        }
      >
        <ReturnLink searchParams={searchParams} />
      </Suspense>
      <div className="product-detail">
        <ProductGallery name={product.name}>
          <PartsArt
            kind={product.kind}
            name={product.name}
            marking={
              product.kind === "oil"
                ? product.name.match(/\d+W-\d+|ATF/)?.[0]
                : product.kind === "battery"
                  ? product.label.replace("·", "")
                  : undefined
            }
            detail={product.kind === "oil" ? product.label : undefined}
          />
        </ProductGallery>
        <section className="detail-information" aria-labelledby="product-title">
          <Link
            className="detail-category"
            href={
              category
                ? `/products?category=${category.id}&sort=newest`
                : "/products"
            }
          >
            {product.category}
            <span aria-hidden="true">↗</span>
          </Link>
          <p className="detail-code">Код: {product.sku}</p>
          <h1 id="product-title">{product.name}</h1>
          <p className="detail-model">{product.label}</p>
          <div className="detail-tags" aria-label="Бүтээгдэхүүний таг">
            {product.tags.map((tag) => (
              <Link
                key={tag}
                href={`/products?tag=${encodeURIComponent(tag)}&sort=newest`}
              >
                {catalogTags.find((item) => item.id === tag)?.name ?? tag}
              </Link>
            ))}
          </div>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <AddToCart
            key={product.id}
            productId={product.id}
            productName={product.name}
          />
          <dl className="detail-specs">
            {specs.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
      <section
        className="detail-description"
        aria-labelledby="description-title"
      >
        <h2 id="description-title">Бүтээгдэхүүний тайлбар</h2>
        <p>{getProductDescription(product)}</p>
      </section>
      <Suspense fallback={<RelatedSkeleton />}>
        <RelatedProducts product={product} searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
