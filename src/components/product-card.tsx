import Link from "next/link";
import { ProductImage } from "./product-image";
import { formatPrice } from "@/lib/home-products";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductCard({ product, returnTo }: { product: CatalogProduct; returnTo?: string }) {
  return (
    <article className="product-card">
      <Link className="product-card-link" href={`/products/${product.id}${returnTo ? `?from=${encodeURIComponent(returnTo)}` : ""}`}>
      <div className="product-image">
        <ProductImage product={product} />
      </div>
      <div className="product-content">
        <p className="product-category">{product.category}</p>
        <h3>{product.name}</h3>
        <p className="product-label">{product.label}</p>
        <p className="product-price">{formatPrice(product.price)}</p>
        <p className="product-sku">Код: {product.sku}</p>
      </div>
      </Link>
    </article>
  );
}
