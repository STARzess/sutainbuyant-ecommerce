import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthPageContent, AuthPageLoading } from "@/components/auth-page";
import "../auth.css";

export const metadata: Metadata = { title: "Бүртгүүлэх | Сутайн Буянт", robots: { index: false, follow: false } };

export default function RegisterPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return <Suspense fallback={<AuthPageLoading mode="register" />}><AuthPageContent mode="register" searchParams={searchParams} /></Suspense>;
}
