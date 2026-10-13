import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageContent, AuthPageLoading } from "@/components/auth-page";
import "../auth.css";

export const metadata: Metadata = { title: "Нэвтрэх | Сутайн Буянт", description: "Сутайн Буянт онлайн дэлгүүрийн бүртгэлээр нэвтэрч, захиалга болон хувийн мэдээллээ удирдаарай.", robots: { index: false, follow: false } };

export default function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Suspense fallback={<AuthPageLoading mode="login" />}><AuthPageContent mode="login" searchParams={searchParams} /></Suspense>;
}
