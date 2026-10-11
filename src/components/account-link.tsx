import Link from "next/link";
import { getSessionUser } from "@/lib/auth";

export function AccountLinkFallback() {
  return <Link className="header-account-link" href="/account" aria-label="Миний бүртгэл"><AccountIcon /><span>Бүртгэл</span></Link>;
}

function AccountIcon() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true"><circle cx="12" cy="8" r="4" /><path d="M4 21v-2a8 8 0 0 1 16 0v2" /></svg>;
}

export async function AccountLink() {
  const result = await getSessionUser().then((user) => ({ available: true, user }), () => ({ available: false, user: null }));
  if (!result.available) return <AccountLinkFallback />;
  return <Link className="header-account-link" href={result.user ? "/account" : "/login"}><AccountIcon /><span>{result.user ? "Миний бүртгэл" : "Нэвтрэх"}</span></Link>;
}
