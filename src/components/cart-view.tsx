"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { useCartProducts } from "@/lib/use-cart-products";
import { changeCartQuantity, getCartSummary, MAX_CART_QUANTITY, removeCartItem, type CartItem } from "@/lib/cart";
import { updateStoredCart, useCart } from "@/lib/cart-store";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice } from "@/lib/home-products";

function BagIcon() {
  return (
    <svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
      <path d="M5 7h14l1 14H4L5 7Zm3 0V5a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

function CartRow({ item, product, onRemove, onQuantity }: {
  item: CartItem;
  product: CatalogProduct;
  onRemove: (id: string, name: string) => void;
  onQuantity: (id: string, value: number | "increase" | "decrease") => boolean;
}) {
  const [draft, setDraft] = useState<string | null>(null);
  const [error, setError] = useState("");
  const inputId = `cart-quantity-${item.id}`;

  function commitQuantity() {
    if (draft === null) return;
    const value = Number(draft);
    if (!Number.isSafeInteger(value) || value < 1 || value > MAX_CART_QUANTITY) {
      setError(`Тоо ширхэгийг 1–${MAX_CART_QUANTITY} хооронд оруулна уу.`);
      return;
    }
    if (onQuantity(item.id, value)) {
      setDraft(null);
      setError("");
    }
  }

  function adjustQuantity(direction: "increase" | "decrease") {
    if (onQuantity(item.id, direction)) {
      setDraft(null);
      setError("");
    }
  }

  return (
    <li className="cart-item" data-product-id={item.id}>
      <Link className="cart-item-image" href={`/products/${item.id}`} aria-label={`${product.name} дэлгэрэнгүй`}>
        <ProductImage product={product} size="cart" />
      </Link>
      <div className="cart-item-info">
        <p className="cart-item-category">{product.category}</p>
        <h2><Link href={`/products/${item.id}`}>{product.name}</Link></h2>
        <p className="cart-item-label">{product.label}</p>
        <p className="cart-item-code">Код: {product.sku}</p>
        <p className="cart-unit-price">Нэгж үнэ <span>{formatPrice(product.price)}</span></p>
      </div>
      <form className="cart-quantity-form" noValidate onSubmit={(event) => { event.preventDefault(); commitQuantity(); }}>
        <label htmlFor={inputId}>Тоо ширхэг</label>
        <div className="cart-quantity-control">
          <button type="button" aria-label={`${product.name} тоо ширхэг хасах`} disabled={item.quantity <= 1} onClick={() => adjustQuantity("decrease")}>−</button>
          <input id={inputId} name="quantity" type="number" min="1" max={MAX_CART_QUANTITY} step="1" value={draft ?? String(item.quantity)} aria-label={`${product.name} тоо ширхэг`} aria-invalid={error ? true : undefined} aria-describedby={error ? `${inputId}-error` : undefined} onChange={(event) => { setDraft(event.target.value); setError(""); }} onBlur={commitQuantity} />
          <button type="button" aria-label={`${product.name} тоо ширхэг нэмэх`} disabled={item.quantity >= MAX_CART_QUANTITY} onClick={() => adjustQuantity("increase")}>+</button>
        </div>
        {error && <p id={`${inputId}-error`} className="cart-field-error" role="alert">{error}</p>}
      </form>
      <div className="cart-item-total">
        <span>Дүн</span>
        <strong>{formatPrice(product.price * item.quantity)}</strong>
      </div>
      <button className="cart-remove" type="button" aria-label={`${product.name} сагснаас устгах`} onClick={() => onRemove(item.id, product.name)}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true">
          <path d="M3 6h18M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7" />
        </svg>
        <span>Устгах</span>
      </button>
    </li>
  );
}

export function CartView() {
  const { items, ready, storageAvailable } = useCart();
  const productData = useCartProducts(items);
  const products = productData.products;
  const [notice, setNotice] = useState("");
  const [writeError, setWriteError] = useState("");
  const productMap = useMemo(() => new Map(products.map((product) => [product.id, product])), [products]);
  const summary = getCartSummary(items, products);

  function onRemove(id: string, name: string) {
    try {
      updateStoredCart((current) => removeCartItem(current, id));
      setWriteError("");
      setNotice(`${name} сагснаас устгагдлаа.`);
    } catch {
      setWriteError("Сагсны өөрчлөлтийг хадгалж чадсангүй. Дахин оролдоно уу.");
      setNotice("");
    }
  }

  function onQuantity(id: string, value: number | "increase" | "decrease") {
    try {
      updateStoredCart((current) => {
        const item = current.find((entry) => entry.id === id);
        if (!item) return current;
        const quantity = typeof value === "number" ? value : item.quantity + (value === "increase" ? 1 : -1);
        return changeCartQuantity(current, id, Math.max(1, Math.min(MAX_CART_QUANTITY, quantity)));
      });
      setWriteError("");
      setNotice("Сагсны тоо ширхэг шинэчлэгдлээ.");
      return true;
    } catch {
      setWriteError("Сагсны өөрчлөлтийг хадгалж чадсангүй. Дахин оролдоно уу.");
      setNotice("");
      return false;
    }
  }

  return (
    <>
      <p className="cart-notice" role="status" aria-live="polite">{notice}</p>
      {(!ready || (storageAvailable && !productData.ready)) ? (
        <div className="cart-loading" role="status" aria-label="Сагсыг ачаалж байна">
          <div className="cart-loading-row" /><div className="cart-loading-row" />
        </div>
      ) : !storageAvailable ? (
        <section className="cart-empty cart-storage-error" role="alert">
          <BagIcon />
          <h2>Сагсыг уншиж чадсангүй</h2>
          <p>Хөтчийн хадгалах зөвшөөрлийг шалгаад хуудсаа дахин ачаална уу.</p>
          <button className="button primary" type="button" onClick={() => window.location.reload()}>Дахин ачаалах</button>
        </section>
      ) : productData.error ? (
        <section className="cart-empty cart-storage-error" role="alert">
          <BagIcon />
          <h2>Бүтээгдэхүүнийг ачаалж чадсангүй</h2>
          <p>Түр хүлээгээд дахин оролдоно уу.</p>
          <button className="button primary" type="button" onClick={productData.retry}>Дахин оролдох</button>
        </section>
      ) : items.length === 0 ? (
        <section className="cart-empty">
          <div className="cart-empty-icon"><BagIcon /></div>
          <h2>Таны сагс хоосон байна</h2>
          <p>Хэрэгтэй бүтээгдэхүүнээ сонгоод сагсандаа нэмээрэй.</p>
          <Link className="button primary" href="/products">Бүтээгдэхүүн үзэх </Link>
        </section>
      ) : (
        <div className="cart-layout">
          <section className="cart-items" aria-label="Сагсанд байгаа бүтээгдэхүүнүүд">
            <div className="cart-list-heading"><h2>Бүтээгдэхүүнүүд</h2><span>{summary.productCount} төрөл · {summary.quantity} ширхэг</span></div>
            <ul>
              {items.map((item) => {
                const product = productMap.get(item.id);
                return product ? <CartRow key={item.id} item={item} product={product} onRemove={onRemove} onQuantity={onQuantity} /> : (
                  <li key={item.id} className="cart-unavailable" data-product-id={item.id}>
                    <div><h2>Бүтээгдэхүүн олдсонгүй</h2><p>Код: {item.id}</p><p>Энэ бүтээгдэхүүнийг сагснаас устгана уу.</p></div>
                    <button className="cart-remove" type="button" aria-label={`${item.id} сагснаас устгах`} onClick={() => onRemove(item.id, "Бүтээгдэхүүн")}>Устгах</button>
                  </li>
                );
              })}
            </ul>
          </section>
          <aside className="cart-summary" aria-labelledby="cart-summary-title">
            <h2 id="cart-summary-title">Сагсны дүн</h2>
            <dl>
              <div><dt>Бүтээгдэхүүний төрөл</dt><dd>{summary.productCount}</dd></div>
              <div><dt>Нийт тоо ширхэг</dt><dd>{summary.quantity}</dd></div>
              <div className="cart-grand-total"><dt>Нийт дүн</dt><dd data-testid="cart-total">{formatPrice(summary.subtotal)}</dd></div>
            </dl>
            {summary.unavailableCount > 0 && <p className="cart-unavailable-note">Олдоогүй бүтээгдэхүүний үнэ нийт дүнд ороогүй.</p>}
            {summary.unavailableCount === 0 && items.length <= 50 ? <Link className="button primary" href="/checkout">Захиалга хийх </Link> : <button className="button primary" type="button" disabled>Захиалга хийх </button>}
            {items.length > 50 && <p className="cart-unavailable-note">Нэг захиалгад 50 хүртэл төрлийн бүтээгдэхүүн сонгоно уу.</p>}
            <Link className="button cart-continue-shopping" href="/products">Бүтээгдэхүүн нэмж сонгох </Link>
          </aside>
        </div>
      )}
      {writeError && <p className="cart-write-error" role="alert">{writeError}</p>}
    </>
  );
}
