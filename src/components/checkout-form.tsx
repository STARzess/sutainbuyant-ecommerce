"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { FormField, FormTextArea } from "./form-field";
import { CheckoutLoading, CheckoutState } from "./checkout-state";
import { CheckoutSummary } from "./checkout-summary";
import { loginHref } from "@/lib/auth-validation";
import { useCart, updateStoredCart } from "@/lib/cart-store";
import { getCartSummary, type CartItem } from "@/lib/cart";
import type { CatalogProduct } from "@/lib/catalog";
import { MAX_ORDER_ITEMS, subtractPurchasedItems, validateCheckout } from "@/lib/checkout";
import { useCartProducts } from "@/lib/use-cart-products";
import { useApiForm } from "@/lib/use-api-form";

export function CheckoutForm({ initialName }: { initialName: string }) {
  const router = useRouter();
  const cart = useCart();
  const productData = useCartProducts(cart.items);
  const [snapshot, setSnapshot] = useState<{ items: CartItem[]; products: CatalogProduct[] } | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [cleanupFailed, setCleanupFailed] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const submitting = useRef(false);
  const formId = useId();
  const fieldId = (name: string) => `checkout-${name}-${formId}`;
  const form = useApiForm<{ order: { id: string } }>("/api/shop/orders", {
    onError: (status) => {
      if (status === 401) { router.replace(loginHref("/checkout")); router.refresh(); }
    },
    networkErrorMessage: "Захиалгын төлөвийг баталгаажуулж чадсангүй. Дахин илгээхээс өмнө шалгана уу.",
  });
  const items = snapshot?.items ?? cart.items;
  const products = snapshot?.products ?? productData.products;
  const summary = getCartSummary(items, products);

  function focusError() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
  }

  if (createdOrderId) return <CheckoutState title="Захиалга бүртгэгдлээ" href={`/orders/${createdOrderId}`} label="Захиалгын дэлгэрэнгүй үзэх">{cleanupFailed ? <p role="alert">Сагсыг цэвэрлэж чадсангүй. Захиалгаа дахин илгээх шаардлагагүй.</p> : <p role="status">Захиалгын дэлгэрэнгүйг нээж байна…</p>}</CheckoutState>;
  if (!cart.ready || (!snapshot && cart.storageAvailable && !productData.ready)) return <CheckoutLoading />;
  if (!cart.storageAvailable && !snapshot) return <CheckoutState title="Сагсыг уншиж чадсангүй" href="/cart" label="Сагс руу буцах"><p>Хөтчийн хадгалах зөвшөөрлийг шалгана уу.</p></CheckoutState>;
  if (productData.error && !snapshot) return <CheckoutState title="Бүтээгдэхүүнийг ачаалж чадсангүй" retry={productData.retry}><p>Түр хүлээгээд дахин оролдоно уу.</p></CheckoutState>;
  if (!items.length) return <CheckoutState title="Таны сагс хоосон байна" href="/products" label="Бүтээгдэхүүн үзэх"><p>Захиалах бүтээгдэхүүнээ сонгож, сагсанд нэмээрэй.</p></CheckoutState>;
  if (summary.unavailableCount > 0 || items.length > MAX_ORDER_ITEMS) return <CheckoutState title="Сагсаа шинэчилнэ үү" href="/cart" label="Сагс руу буцах"><p>{summary.unavailableCount ? "Олдоогүй бүтээгдэхүүнийг сагснаас устгана уу." : `Нэг захиалгад ${MAX_ORDER_ITEMS} хүртэл төрлийн бүтээгдэхүүн сонгоно уу.`}</p></CheckoutState>;

  return <div className="checkout-layout">
    <section className="checkout-card" aria-labelledby="checkout-contact-title">
      <div className="checkout-card-heading"><h2 id="checkout-contact-title">Хүргэлтийн мэдээлэл</h2></div>
      <p className="checkout-description">Хүлээн авагчийн мэдээлэл болон хүргэлтийн хаягаа оруулна уу.</p>
      <form ref={formRef} className="checkout-form" noValidate aria-busy={form.pending} onChange={(event) => {
        if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) form.clearField(event.target.name);
      }} onSubmit={async (event) => {
        event.preventDefault();
        if (submitting.current) return;
        const purchased = items.map((item) => ({ ...item }));
        const input = { ...Object.fromEntries(new FormData(event.currentTarget)), items: purchased.map((item) => ({ product_id: Number(item.id), quantity: item.quantity })) };
        const validation = validateCheckout(input);
        if (!validation.valid) { form.showValidation(validation.errors); focusError(); return; }
        submitting.current = true;
        setSnapshot({ items: purchased, products: [...products] });
        const result = await form.submit(validation.values);
        if (!result) { submitting.current = false; setSnapshot(null); focusError(); return; }
        setCreatedOrderId(result.order.id);
        try { updateStoredCart((current) => subtractPurchasedItems(current, purchased)); }
        catch { setCleanupFailed(true); return; }
        router.replace(`/orders/${result.order.id}`);
        router.refresh();
      }}>
        <FormField id={fieldId("name")} name="customer_name" label="Хүлээн авагчийн нэр" autoComplete="name" defaultValue={initialName} maxLength={100} required disabled={form.pending} errors={form.errors.customer_name} />
        <FormField id={fieldId("phone")} name="customer_phone" label="Утасны дугаар" type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="9911 2233" required disabled={form.pending} errors={form.errors.customer_phone} />
        <FormTextArea id={fieldId("address")} name="shipping_address" label="Хүргэлтийн хаяг" autoComplete="shipping street-address" rows={3} maxLength={500} placeholder="Дүүрэг, хороо, байр, тоот" required disabled={form.pending} errors={form.errors.shipping_address} />
        <FormTextArea id={fieldId("note")} name="note" label="Тэмдэглэл" hint="Заавал бөглөх шаардлагагүй." rows={2} maxLength={1000} placeholder="Хүргэлттэй холбоотой нэмэлт мэдээлэл" disabled={form.pending} errors={form.errors.note} />
        <p className="form-message" role="alert">{form.message}</p>
        <button className="button primary checkout-submit" type="submit" disabled={form.pending}>{form.pending ? <><span className="form-spinner" aria-hidden="true" />Захиалгыг илгээж байна…</> : <>Захиалгаа баталгаажуулах </>}</button>
        <span className="sr-only" role="status">{form.pending ? "Захиалгыг боловсруулж байна." : ""}</span>
      </form>
    </section>
    <CheckoutSummary items={items} products={products} errors={form.errors} />
  </div>;
}
