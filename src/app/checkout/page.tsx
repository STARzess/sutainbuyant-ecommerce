import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { CheckoutForm } from "@/components/checkout-form";
import { CheckoutLoading } from "@/components/checkout-state";
import "./checkout.css";

export const metadata: Metadata = { title: "Захиалга хийх | Сутайн Буянт", robots: { index: false, follow: false } };

async function CheckoutContent() {
  const user = await requireUser("/checkout");
  return <CheckoutForm initialName={user.name} />;
}

export default function CheckoutPage() {
  return <div className="container checkout-page">
    <nav className="breadcrumb" aria-label="Хуудасны зам"><Link href="/">Нүүр</Link><span aria-hidden="true">/</span><Link href="/cart">Сагс</Link><span aria-hidden="true">/</span><span aria-current="page">Захиалга хийх</span></nav>
    <header className="checkout-heading"><p>ЗАХИАЛГЫН МЭДЭЭЛЭЛ</p><h1>Захиалга хийх</h1></header>
    <Suspense fallback={<CheckoutLoading />}><CheckoutContent /></Suspense>
  </div>;
}
