import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { getCustomerOrder } from "@/lib/orders";
import { validOrderId } from "@/lib/orders-api-client";
import { CheckoutLoading } from "@/components/checkout-state";
import { OrderReceipt } from "@/components/order-receipt";
import "../../checkout/checkout.css";

export const metadata: Metadata = { title: "Захиалгын дэлгэрэнгүй | Сутайн Буянт", robots: { index: false, follow: false } };

async function OrderContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!validOrderId(id)) notFound();
  await requireUser(`/orders/${id}`);
  const order = await getCustomerOrder(id);
  if (!order) notFound();
  return <OrderReceipt order={order} />;
}

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  return <div className="container checkout-page"><nav className="breadcrumb" aria-label="Хуудасны зам"><Link href="/">Нүүр</Link><span aria-hidden="true">/</span><span aria-current="page">Захиалгын дэлгэрэнгүй</span></nav><Suspense fallback={<CheckoutLoading />}><OrderContent params={params} /></Suspense></div>;
}
