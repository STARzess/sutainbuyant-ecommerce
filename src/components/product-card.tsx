import Link from "next/link";
import { PartsArt } from "./parts-art";
import { formatPrice } from "@/lib/home-products";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductCard({ product, returnTo }: { product: CatalogProduct; returnTo?: string }) {
  return (
    <article className="product-card">
      <Link className="product-card-link" href={`/products/${product.id}${returnTo ? `?from=${encodeURIComponent(returnTo)}` : ""}`}>
      <div className="product-image">
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
