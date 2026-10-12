"use client";

import { useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { canCancelOrder, type OrderStatus } from "@/lib/orders-api-client";
import { loginHref } from "@/lib/auth-validation";
import { useApiForm } from "@/lib/use-api-form";

export function CancelOrder({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [completed, setCompleted] = useState(false);
  const panelId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);
  const form = useApiForm<{ order: { id: string; status: "cancelled" } }>(`/api/shop/orders/${orderId}/cancel`, {
    onError: (code) => {
      if (code === 401) router.replace(loginHref(`/orders/${orderId}`));
      router.refresh();
    },
    networkErrorMessage: "Цуцлалтын төлөвийг баталгаажуулж чадсангүй. Хуудсаа шинэчлээд шалгана уу.",
  });

  if (completed || (asking && status === "cancelled")) return <p className="order-cancel-success" role="status">Захиалга цуцлагдсан байна.</p>;
  if (!canCancelOrder(status)) return form.message ? <p className="form-message" role="alert">{form.message}</p> : null;

  return <section className="order-cancel">
    {!asking ? <button className="button order-cancel-trigger" type="button" ref={triggerRef} aria-expanded={false} aria-controls={panelId} onClick={() => {
      setAsking(true);
      requestAnimationFrame(() => confirmRef.current?.focus());
    }}>Захиалга цуцлах</button> : <div id={panelId} className="order-cancel-panel" role="group" aria-labelledby={`${panelId}-title`} aria-busy={form.pending}>
      <h2 id={`${panelId}-title`}>Захиалга цуцлах уу?</h2>
      <p>Баталгаажуулсны дараа энэ захиалга цуцлагдана.</p>
      <div className="order-cancel-actions">
        <button className="button order-cancel-confirm" type="button" ref={confirmRef} disabled={form.pending} onClick={async () => {
          const result = await form.submit({});
          if (result?.order.status === "cancelled") { setCompleted(true); router.refresh(); }
        }}>{form.pending ? "Цуцалж байна…" : "Цуцлахыг баталгаажуулах"}</button>
        <button className="button orders-secondary" type="button" disabled={form.pending} onClick={() => {
          setAsking(false);
          requestAnimationFrame(() => triggerRef.current?.focus());
        }}>Болих</button>
      </div>
    </div>}
    <p className="form-message" role="alert">{form.message}</p>
  </section>;
}
