"use client";

import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session-context";
import { useApiForm } from "@/lib/use-api-form";

export function LogoutButton() {
  const router = useRouter();
  const session = useSession();
  const form = useApiForm<{ message: string; revocationConfirmed: boolean }>("/api/auth/logout");
  return <div className="account-logout"><button className="button account-logout-button" type="button" disabled={form.pending || session.updating} onClick={async () => {
    const result = await form.submit({});
    if (result) {
      session.setUser(null);
      router.replace(result.revocationConfirmed ? "/login" : "/login?logout=local");
      router.refresh();
    }
  }}>{form.pending ? "Гарч байна…" : "Гарах"}</button><p className="form-message" role="alert">{form.message}</p></div>;
}
