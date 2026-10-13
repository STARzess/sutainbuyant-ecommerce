import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ProductDetailSkeleton } from "@/components/product-detail-skeleton";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductGallery } from "@/components/product-gallery";
import { ProductImage } from "@/components/product-image";
import type { CatalogProduct, SearchParams } from "@/lib/catalog";
import { formatPrice } from "@/lib/format";
import { getCatalogReturnHref, getProductDescription } from "@/lib/product-details";
import { defaultSocialImage } from "@/lib/social-metadata";
import { getShopProduct } from "@/lib/shop-api";
import "./product-detail.css";

type Props = { params: Promise<{ id: string }>; searchParams: Promise<SearchParams> };

async function getProduct(id: string) {
  const result = await getShopProduct(id);
  if (!result) notFound();
  return result;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { product } = await getProduct((await params).id);
  const title = `${product.name}${product.label ? ` — ${product.label}` : ""} | Сутайн Буянт`;
  const description = `${product.name}. ${product.label}. Код: ${product.sku}. Үнэ: ${formatPrice(product.price)}. ${getProductDescription(product)}`;
  return {
    title, description, alternates: { canonical: `/products/${product.id}` },
    openGraph: { title, description, type: "website", locale: "mn_MN", siteName: "Сутайн Буянт", images: product.image ? [product.image.url] : [defaultSocialImage] },
    twitter: { card: "summary_large_image", title, description, images: product.image ? [product.image.url] : [defaultSocialImage] },
  };
}

async function ReturnLink({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const href = getCatalogReturnHref((await searchParams).from);
  return <Link href={href} className="detail-return">Жагсаалт руу буцах</Link>;
}

async function RelatedProducts({ related, searchParams }: { related: CatalogProduct[]; searchParams: Promise<SearchParams> }) {
  const returnTo = getCatalogReturnHref((await searchParams).from);
  if (!related.length) return null;
  return (
    <section className="detail-related" aria-labelledby="related-title">
      <div className="section-heading">
        <h2 id="related-title">Холбоотой бүтээгдэхүүнүүд</h2>
        <Link className="section-link" href="/products">Бүгдийг харах </Link>
      </div>
      <div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} returnTo={returnTo} />)}</div>
    </section>
  );
}

function RelatedSkeleton() {
  return (
    <section className="detail-related" aria-label="Холбоотой бүтээгдэхүүнүүдийг ачаалж байна">
      <div className="section-heading"><h2>Холбоотой бүтээгдэхүүнүүд</h2></div>
      <div className="product-grid" aria-hidden="true">{Array.from({ length: 4 }, (_, index) => <div key={index} className="skeleton-card" />)}</div>
    </section>
  );
}

async function ProductContent({ params, searchParams }: Props) {
  const { product, related } = await getProduct((await params).id);
  const specs = [["Бүтээгдэхүүний код", product.sku], ["Ангилал", product.category], ["Таг", product.label]].filter(([, value]) => value);
  return (
    <div className="container detail-page">
      <nav className="breadcrumb detail-breadcrumb" aria-label="Хуудасны зам">
        <Link href="/">Нүүр</Link><span aria-hidden="true">/</span><Link href="/products">Бүтээгдэхүүн</Link><span aria-hidden="true">/</span><span aria-current="page">{product.name}</span>
      </nav>
      <Suspense fallback={<span className="detail-return" aria-hidden="true">Жагсаалт руу буцах</span>}><ReturnLink searchParams={searchParams} /></Suspense>
      <div className="product-detail">
        <ProductGallery name={product.name}><ProductImage product={product} size="detail" priority /></ProductGallery>
        <section className="detail-information" aria-labelledby="product-title">
          <Link className="detail-category" href={product.categoryId ? `/products?category=${product.categoryId}&sort=newest` : "/products"}>{product.category}</Link>
          <p className="detail-code">Код: {product.sku}</p>
          <h1 id="product-title">{product.name}</h1><p className="detail-model">{product.label}</p>
          <div className="detail-tags" aria-label="Бүтээгдэхүүний таг">
            {product.tagNames?.map((tag) => <Link key={tag.id} href={`/products?tag=${encodeURIComponent(tag.id)}&sort=newest`}>{tag.name}</Link>)}
          </div>
          <p className="detail-price">{formatPrice(product.price)}</p>
          <AddToCart key={product.id} productId={product.id} productName={product.name} />
          <dl className="detail-specs">{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        </section>
      </div>
      <section className="detail-description" aria-labelledby="description-title"><h2 id="description-title">Бүтээгдэхүүний тайлбар</h2><p>{getProductDescription(product)}</p></section>
      <Suspense fallback={<RelatedSkeleton />}><RelatedProducts related={related} searchParams={searchParams} /></Suspense>
    </div>
  );
}

export default function ProductPage(props: Props) {
  return <Suspense fallback={<ProductDetailSkeleton />}><ProductContent {...props} /></Suspense>;
}
