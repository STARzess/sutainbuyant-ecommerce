import { PartsArt } from "./parts-art";
import { formatPrice } from "@/lib/home-products";
import type { CatalogProduct } from "@/lib/catalog";

export function ProductCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="product-card">
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
    </article>
  );
}
