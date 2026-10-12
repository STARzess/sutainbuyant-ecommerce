import Link from "next/link";
import type { FieldErrors } from "@/lib/api-client";
import type { CartItem } from "@/lib/cart";
import type { CatalogProduct } from "@/lib/catalog";
import { getCartSummary } from "@/lib/cart";
import { formatPrice } from "@/lib/home-products";
import { ProductImage } from "./product-image";

export function CheckoutSummary({ items, products, errors = {} }: {
  items: CartItem[]; products: CatalogProduct[]; errors?: FieldErrors;
}) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const summary = getCartSummary(items, products);
  return <aside className="checkout-summary" aria-labelledby="checkout-summary-title">
    <div className="checkout-card-heading"><h2 id="checkout-summary-title">Таны захиалга</h2><span>{summary.quantity} ширхэг</span></div>
    <ul className="checkout-items">
      {items.map((item, index) => {
        const product = productMap.get(item.id);
        const error = errors[`items.${index}.product_id`]?.[0] ?? errors[`items.${index}.quantity`]?.[0];
        return <li key={item.id}>
          {product && <><span className="checkout-item-image"><ProductImage product={product} size="cart" /></span><div className="checkout-item-info"><h3>{product.name}</h3><p>{formatPrice(product.price)} × {item.quantity}</p><strong>{formatPrice(product.price * item.quantity)}</strong></div></>}
          {error && <p className="form-field-error checkout-item-error" role="alert">{error}</p>}
        </li>;
      })}
    </ul>
    {errors.items?.[0] && <p className="form-field-error" role="alert">{errors.items[0]}</p>}
    <dl className="checkout-total"><dt>Нийт дүн</dt><dd data-testid="checkout-total">{formatPrice(summary.subtotal)}</dd></dl>
    <Link className="checkout-edit-cart" href="/cart">Сагсаа өөрчлөх </Link>
  </aside>;
}
