"use client";

import { useRef, useState } from "react";
import { useSession } from "@/lib/session-context";
import type { SessionUser } from "@/lib/auth-validation";
import { validatePasswordValues, validateProfileValues } from "@/lib/profile-validation";
import { useAccountForm } from "@/lib/use-account-form";
import { FormField } from "./form-field";

function FormFeedback({ message, success }: { message: string; success: string }) {
  return <><p className="form-message" role="alert">{message}</p><p className="profile-success" role="status">{success}</p></>;
}

export function ProfileForm({ user }: { user: SessionUser }) {
  const session = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const form = useAccountForm<{ user: SessionUser }>("/api/shop/profile", formRef);
  const [values, setValues] = useState({ name: user.name, email: user.email });
  return <section className="profile-card" aria-labelledby={`${form.formId}-title`}>
    <h2 id={`${form.formId}-title`}>Мэдээлэл засах</h2>
    <p className="profile-description">Өөрийн нэр, имэйл хаягийг шинэчлээрэй.</p>
    <form className="profile-form" ref={formRef} noValidate aria-busy={form.pending} onChange={form.onChange} onSubmit={async event => {
      event.preventDefault(); form.setSuccess("");
      const validation = validateProfileValues(values);
      if (!validation.valid) { form.showValidation(validation.errors); form.focusError(); return; }
      const finish = session.beginUpdate({ ...user, ...validation.values });
      if (!finish) return;
      const result = await form.submit(validation.values);
      finish(result?.user);
      if (result?.user) {
        setValues({ name: result.user.name, email: result.user.email });
        form.setSuccess("Мэдээлэл амжилттай шинэчлэгдлээ."); form.refresh();
      } else form.focusError();
    }}>
      <FormField id={`${form.formId}-name`} name="name" label="Нэр" autoComplete="name" required maxLength={255} value={values.name} onChange={event => setValues(current => ({ ...current, name: event.target.value }))} disabled={form.pending} errors={form.errors.name} />
      <FormField id={`${form.formId}-email`} name="email" label="Имэйл хаяг" type="email" autoComplete="email" inputMode="email" autoCapitalize="none" spellCheck={false} required maxLength={255} value={values.email} onChange={event => setValues(current => ({ ...current, email: event.target.value }))} disabled={form.pending} errors={form.errors.email} />
      <button className="button primary profile-submit" type="submit" disabled={form.pending}>{form.pending ? "Хадгалж байна…" : "Мэдээлэл хадгалах"}</button>
      <FormFeedback message={form.message} success={form.success} />
    </form>
  </section>;
}

export function PasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const form = useAccountForm<{ message: string }>("/api/shop/profile/password", formRef);
  const [revision, setRevision] = useState(0);
  return <section className="profile-card" aria-labelledby={`${form.formId}-title`}>
    <h2 id={`${form.formId}-title`}>Нууц үг солих</h2>
    <p className="profile-description">Одоогийн нууц үгээ оруулж, шинэ нууц үг тохируулна уу.</p>
    <form className="profile-form" ref={formRef} noValidate aria-busy={form.pending} onChange={form.onChange} onSubmit={async event => {
      event.preventDefault(); form.setSuccess("");
      const validation = validatePasswordValues(Object.fromEntries(new FormData(event.currentTarget)));
      if (!validation.valid) { form.showValidation(validation.errors); form.focusError(); return; }
      const result = await form.submit(validation.values);
      if (result) { formRef.current?.reset(); setRevision(current => current + 1); form.setSuccess("Нууц үг амжилттай солигдлоо."); }
      else form.focusError();
    }}>
      <FormField key={`current-${revision}`} id={`${form.formId}-current-password`} name="current_password" label="Одоогийн нууц үг" type="password" autoComplete="current-password" required maxLength={1024} disabled={form.pending} errors={form.errors.current_password} />
      <FormField key={`new-${revision}`} id={`${form.formId}-password`} name="password" label="Шинэ нууц үг" type="password" autoComplete="new-password" required minLength={6} maxLength={1024} hint="Хамгийн багадаа 6 тэмдэгт." disabled={form.pending} errors={form.errors.password} />
      <FormField key={`confirm-${revision}`} id={`${form.formId}-confirmation`} name="password_confirmation" label="Нууц үг давтах" type="password" autoComplete="new-password" required maxLength={1024} disabled={form.pending} errors={form.errors.password_confirmation} />
      <button className="button primary profile-submit" type="submit" disabled={form.pending}>{form.pending ? "Солиж байна…" : "Нууц үг солих"}</button>
      <FormFeedback message={form.message} success={form.success} />
    </form>
  </section>;
}
