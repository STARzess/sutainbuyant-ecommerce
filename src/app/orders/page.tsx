import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { getCustomerOrders } from "@/lib/orders";
import { toOrderListItem } from "@/lib/order-display";
import { OrdersList } from "@/components/orders-list";
import { CheckoutLoading } from "@/components/checkout-state";
import "../checkout/checkout.css";
import "./orders.css";

export const metadata: Metadata = { title: "Миний захиалгууд | Сутайн Буянт", description: "Өөрийн захиалгуудын жагсаалт, төлөв болон дэлгэрэнгүй мэдээллийг харах.", robots: { index: false, follow: false } };

async function OrdersContent() {
  await requireUser("/orders");
  const orders = await getCustomerOrders();
  return <OrdersList orders={orders.map(toOrderListItem)} />;
}

export default function OrdersPage() {
  return <div className="container checkout-page">
    <nav className="breadcrumb" aria-label="Хуудасны зам"><Link href="/">Нүүр</Link><span aria-hidden="true">/</span><Link href="/account">Миний бүртгэл</Link><span aria-hidden="true">/</span><span aria-current="page">Миний захиалгууд</span></nav>
    <header className="checkout-heading"><p>ТАНЫ ЗАХИАЛГУУД</p><h1>Миний захиалгууд</h1></header>
    <Suspense fallback={<CheckoutLoading />}><OrdersContent /></Suspense>
  </div>;
}
