"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useId, useRef } from "react";
import { FormField } from "./form-field";
import { useApiForm } from "@/lib/use-api-form";
import { safeReturnTo, validateAuthValues, type AuthMode, type SessionUser } from "@/lib/auth-validation";

export function AuthForm({ mode, returnTo }: { mode: AuthMode; returnTo: string }) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const formId = useId();
  const fieldId = (name: string) => `${mode}-${name}-${formId}`;
  const form = useApiForm<{ user: SessionUser }>(`/api/auth/${mode}`);
  const registering = mode === "register";
  const destination = safeReturnTo(returnTo);
  const otherPage = `${registering ? "/login" : "/register"}?${new URLSearchParams({ next: destination })}`;

  function focusError() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus());
  }

  return (
    <form className="auth-form" ref={formRef} noValidate aria-busy={form.pending} onChange={(event) => {
      if (event.target instanceof HTMLInputElement) form.clearField(event.target.name);
    }} onSubmit={async (event) => {
      event.preventDefault();
      const validation = validateAuthValues(mode, Object.fromEntries(new FormData(event.currentTarget)));
      if (!validation.valid) { form.showValidation(validation.errors); focusError(); return; }
      const result = await form.submit(validation.values);
      if (result?.user) { router.replace(destination); router.refresh(); }
      else focusError();
    }}>
      {registering && <FormField id={fieldId("name")} name="name" label="Нэр" autoComplete="name" required maxLength={255} placeholder="Таны нэр" errors={form.errors.name} disabled={form.pending} />}
      <FormField id={fieldId("email")} name="email" label="Имэйл хаяг" type="email" autoComplete="email" inputMode="email" spellCheck={false} autoCapitalize="none" maxLength={255} required placeholder="name@example.com" errors={form.errors.email} disabled={form.pending} />
      <FormField id={fieldId("password")} name="password" label="Нууц үг" type="password" autoComplete={registering ? "new-password" : "current-password"} required minLength={6} maxLength={1024} hint={registering ? "Хамгийн багадаа 6 тэмдэгт." : undefined} errors={form.errors.password} disabled={form.pending} />
      {registering && <FormField id={fieldId("password_confirmation")} name="password_confirmation" label="Нууц үг давтах" type="password" autoComplete="new-password" required maxLength={1024} errors={form.errors.password_confirmation} disabled={form.pending} />}
      <p className="form-message" role="alert">{form.message}</p>
      <button className="button primary auth-submit" type="submit" disabled={form.pending}>
        {form.pending ? <><span className="form-spinner" aria-hidden="true" />{registering ? "Бүртгэж байна…" : "Нэвтэрч байна…"}</> : <>{registering ? "Бүртгүүлэх" : "Нэвтрэх"}<span aria-hidden="true"></span></>}
      </button>
      <span className="sr-only" role="status">{form.pending ? "Хүсэлтийг боловсруулж байна." : ""}</span>
      <p className="auth-switch">{registering ? "Бүртгэлтэй юу?" : "Бүртгэлгүй юу?"} <Link href={otherPage}>{registering ? "Нэвтрэх" : "Бүртгүүлэх"}</Link></p>
    </form>
  );
}
