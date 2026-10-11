import type { FieldErrors } from "./api-client";

export type AuthMode = "login" | "register";
export type AuthValues = { email: string; password: string; name?: string; password_confirmation?: string };
export type SessionUser = { id: string; name: string; email: string };
export const SESSION_COOKIE = "sb_session";

export function safeReturnTo(value: unknown, fallback = "/account") {
  if (typeof value !== "string" || value.length > 2048 || !value.startsWith("/") || value.startsWith("//") || /[\u0000-\u0020\\]/.test(value)) return fallback;
  try {
    const url = new URL(value, "https://store.invalid");
    if (url.origin !== "https://store.invalid" || !/^\/(?:$|account(?:\/|$)|products(?:\/|$)|cart(?:\/|$)|checkout(?:\/|$)|orders(?:\/|$)|profile(?:\/|$))/.test(url.pathname)) return fallback;
    return url.pathname + url.search;
  } catch { return fallback; }
}

export function loginHref(returnTo: string) {
  return `/login?${new URLSearchParams({ next: safeReturnTo(returnTo) })}`;
}

export function validateAuthValues(mode: AuthMode, input: unknown) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  const value = (key: string) => typeof source[key] === "string" ? source[key] as string : "";
  const values: AuthValues = { email: value("email").trim(), password: value("password") };
  const errors: FieldErrors = {};
  if (!values.email) errors.email = ["Имэйл хаягаа оруулна уу."];
  else if (values.email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = ["Имэйл хаягаа зөв оруулна уу."];
  if (!values.password) errors.password = ["Нууц үгээ оруулна уу."];
  else if (values.password.length < 6) errors.password = ["Нууц үг хамгийн багадаа 6 тэмдэгттэй байна."];
  else if (values.password.length > 1024) errors.password = ["Нууц үг хэт урт байна."];
  if (mode === "register") {
    values.name = value("name").trim();
    values.password_confirmation = value("password_confirmation");
    if (!values.name) errors.name = ["Нэрээ оруулна уу."];
    else if (values.name.length > 255) errors.name = ["Нэр 255 тэмдэгтээс хэтрэхгүй байна."];
    if (!values.password_confirmation) errors.password_confirmation = ["Нууц үгээ давтан оруулна уу."];
    else if (values.password_confirmation !== values.password) errors.password_confirmation = ["Нууц үг таарахгүй байна."];
  }
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

// Return only translated, known field errors; upstream responses may contain private data.
export function authFieldErrors(mode: AuthMode, errors: FieldErrors): FieldErrors {
  const result: FieldErrors = {};
  const defaults: Record<string, string> = {
    name: "Нэрээ шалгаад дахин оруулна уу.",
    email: mode === "login" ? "Имэйл хаяг эсвэл нууц үг буруу байна." : "Имэйл хаягаа шалгаад дахин оруулна уу.",
    password: mode === "login" ? "Имэйл хаяг эсвэл нууц үг буруу байна." : "Нууц үг хамгийн багадаа 6 тэмдэгттэй байна.",
    password_confirmation: "Нууц үг таарахгүй байна.",
  };
  for (const field of mode === "register" ? Object.keys(defaults) : ["email", "password"]) {
    if (!errors[field]?.length) continue;
    const duplicate = field === "email" && mode === "register" && errors[field].some((message) => /taken|already|бүртгэлтэй|ашиглагд/i.test(message));
    result[field] = [duplicate ? "Энэ имэйл хаяг бүртгэлтэй байна." : defaults[field]];
  }
  return result;
}
