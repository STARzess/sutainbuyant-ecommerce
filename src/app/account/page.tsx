import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { requireUser } from "@/lib/auth";
import { AccountIdentity } from "@/components/account-identity";
import { ProfileForm, PasswordForm } from "@/components/profile-forms";
import { LogoutButton } from "@/components/logout-button";
import "../auth.css";
import "../orders/orders.css";
import "./profile.css";

export const metadata: Metadata = { title: "Миний бүртгэл | Сутайн Буянт", description: "Бүртгэлийн мэдээллээ шинэчлэх, нууц үгээ солих болон захиалгуудаа харах.", robots: { index: false, follow: false } };

async function AccountContent() {
  const user = await requireUser("/account");
  return <div className="profile-layout"><section className="account-card" aria-labelledby="account-title">
    <AccountIdentity initialUser={user} />
    <Link className="button account-orders-link" href="/orders">Миний захиалгууд</Link>
    <Link className="button primary account-browse" href="/products">Бүтээгдэхүүн үзэх </Link>
    <LogoutButton />
  </section><div className="profile-panels"><ProfileForm key={user.id} user={user} /><PasswordForm key={user.id} /></div></div>;
}

export default function AccountPage() {
  return <div className="container account-page"><Suspense fallback={<div className="account-card auth-skeleton" role="status" aria-label="Бүртгэлийг ачаалж байна"><div /><div /><div /></div>}><AccountContent /></Suspense></div>;
}
