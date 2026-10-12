import Link from "next/link";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { safeReturnTo, type AuthMode } from "@/lib/auth-validation";
import { AuthForm } from "./auth-form";

export function AuthFrame({ mode, children }: { mode: AuthMode; children: React.ReactNode }) {
  const registering = mode === "register";
  return (
    <div className="container auth-page">
      <Link href="/" className="auth-back"> Нүүр хуудас</Link>
      <div className="auth-layout">
        <aside className="auth-intro">
          <p className="auth-eyebrow">СУТАЙН БУЯНТ</p>
          <h2>Таны худалдан авалт<br />эндээс эхэлнэ.</h2>
          <p className="auth-intro-copy">Хэрэгтэй бүтээгдэхүүнээ сонгож, худалдан авалтаа үргэлжлүүлээрэй.</p>
          <div className="auth-illustration" aria-hidden="true"><svg viewBox="0 0 240 200" fill="none"><circle cx="120" cy="105" r="86" stroke="currentColor" opacity=".15" /><circle cx="120" cy="105" r="65" stroke="currentColor" opacity=".15" /><path d="M71 75h98l10 103H61L71 75Z" fill="currentColor" fillOpacity=".12" stroke="currentColor" strokeWidth="2" /><path d="M97 83V64a23 23 0 0 1 46 0v19" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="m100 127 14 14 28-31" stroke="#f07983" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" /><path d="M197 59v16m-8-8h16M44 121v12m-6-6h12" stroke="#f07983" strokeWidth="2" strokeLinecap="round" /></svg></div>
          <Link href="/products" className="auth-browse">Бүтээгдэхүүн үзэх </Link>
        </aside>
        <section className="auth-panel" aria-labelledby="auth-title">
          <h1 id="auth-title">{registering ? "Бүртгүүлэх" : "Тавтай морил"}</h1>
          <p className="auth-subtitle">{registering ? "Мэдээллээ оруулж, шинэ бүртгэл үүсгээрэй." : "Имэйл хаяг, нууц үгээрээ нэвтрээрэй."}</p>
          {children}
        </section>
      </div>
    </div>
  );
}

export async function AuthPageContent({ mode, searchParams }: { mode: AuthMode; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const returnTo = safeReturnTo(params.next);
  if (await getSessionUser()) redirect(returnTo);
  return <AuthFrame mode={mode}><AuthForm mode={mode} returnTo={returnTo} /></AuthFrame>;
}

export function AuthPageLoading({ mode }: { mode: AuthMode }) {
  return <AuthFrame mode={mode}><div className="auth-skeleton" role="status" aria-label="Хуудсыг ачаалж байна"><div /><div /><div /></div></AuthFrame>;
}
