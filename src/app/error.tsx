"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function ErrorPage({ reset }: { reset: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="container shop-error" role="alert" aria-busy={pending}>
      <h1>Мэдээллийг ачаалж чадсангүй</h1>
      <p>Түр хүлээгээд дахин оролдоно уу.</p>
      <button className="button primary" type="button" disabled={pending} onClick={() => startTransition(() => { reset(); router.refresh(); })}>Дахин оролдох</button>
    </div>
  );
}
