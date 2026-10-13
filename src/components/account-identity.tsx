"use client";

import type { SessionUser } from "@/lib/auth-validation";
import { useSession } from "@/lib/session-context";

export function AccountIdentity({ initialUser }: { initialUser: SessionUser }) {
  const session = useSession();
  const user = session.user?.id === initialUser.id ? session.user : initialUser;
  return <>
    <div className="account-avatar" aria-hidden="true">{user.name.slice(0, 1).toUpperCase()}</div>
    <p className="auth-panel-eyebrow">ТАНЫ БҮРТГЭЛ</p>
    <h1 id="account-title">Миний бүртгэл</h1>
    <p className="account-welcome">Сайн байна уу, {user.name}.</p>
    <dl className="account-details"><div><dt>Нэр</dt><dd>{user.name}</dd></div><div><dt>Имэйл хаяг</dt><dd>{user.email || "Бүртгэгдээгүй"}</dd></div></dl>
  </>;
}
