import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { LogoutButton } from "@/components/logout-button";
import "../auth.css";
import "../orders/orders.css";

export const metadata: Metadata = { title: "Миний бүртгэл | Сутайн Буянт", robots: { index: false, follow: false } };

async function AccountContent() {
  const user = await requireUser("/account");
  return <section className="account-card" aria-labelledby="account-title">
    <div className="account-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div>
    <p className="auth-panel-eyebrow">ТАНЫ БҮРТГЭЛ</p>
    <h1 id="account-title">Миний бүртгэл</h1>
    <p className="account-welcome">Сайн байна уу, {user.name}.</p>
    <dl className="account-details"><div><dt>Нэр</dt><dd>{user.name}</dd></div><div><dt>Имэйл хаяг</dt><dd>{user.email || "Бүртгэгдээгүй"}</dd></div></dl>
    <Link className="button account-orders-link" href="/orders">Миний захиалгууд</Link>
    <Link className="button primary account-browse" href="/products">Бүтээгдэхүүн үзэх </Link>
    <LogoutButton />
  </section>;
}

export default function AccountPage() {
  return <div className="container account-page"><Suspense fallback={<div className="account-card auth-skeleton" role="status" aria-label="Бүртгэлийг ачаалж байна"><div /><div /><div /></div>}><AccountContent /></Suspense></div>;
}
