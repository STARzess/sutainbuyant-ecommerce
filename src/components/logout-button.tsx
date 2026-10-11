"use client";

import { useRouter } from "next/navigation";
import { useApiForm } from "@/lib/use-api-form";

export function LogoutButton() {
  const router = useRouter();
  const form = useApiForm<{ message: string }>("/api/auth/logout");
  return <div className="account-logout"><button className="button account-logout-button" type="button" disabled={form.pending} onClick={async () => {
    if (await form.submit({})) { router.replace("/login"); router.refresh(); }
  }}>{form.pending ? "Гарч байна…" : "Гарах"}</button><p className="form-message" role="alert">{form.message}</p></div>;
}
