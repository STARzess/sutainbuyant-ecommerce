import type { FieldErrors } from "./api-client";

export type ProfileMode = "details" | "password";
export type ProfileValues = { name: string; email: string };
export type PasswordValues = { current_password: string; password: string; password_confirmation: string };

function fields(input: unknown) {
  const source = input && typeof input === "object" && !Array.isArray(input) ? input as Record<string, unknown> : {};
  return (key: string) => typeof source[key] === "string" ? source[key] as string : "";
}

export function validateProfileValues(input: unknown) {
  const field = fields(input);
  const values: ProfileValues = { name: field("name").trim(), email: field("email").trim() };
  const errors: FieldErrors = {};
  if (!values.name) errors.name = ["Нэрээ оруулна уу."];
  else if (values.name.length > 255) errors.name = ["Нэр 255 тэмдэгтээс хэтрэхгүй байна."];
  if (!values.email) errors.email = ["Имэйл хаягаа оруулна уу."];
  else if (values.email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errors.email = ["Имэйл хаягаа зөв оруулна уу."];
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function validatePasswordValues(input: unknown) {
  const field = fields(input);
  const values: PasswordValues = { current_password: field("current_password"), password: field("password"), password_confirmation: field("password_confirmation") };
  const errors: FieldErrors = {};
  if (!values.current_password) errors.current_password = ["Одоогийн нууц үгээ оруулна уу."];
  else if (values.current_password.length > 1024) errors.current_password = ["Нууц үг хэт урт байна."];
  if (!values.password) errors.password = ["Шинэ нууц үгээ оруулна уу."];
  else if (values.password.length < 6) errors.password = ["Нууц үг хамгийн багадаа 6 тэмдэгттэй байна."];
  else if (values.password.length > 1024) errors.password = ["Нууц үг хэт урт байна."];
  if (!values.password_confirmation) errors.password_confirmation = ["Нууц үгээ давтан оруулна уу."];
  else if (values.password_confirmation !== values.password) errors.password_confirmation = ["Нууц үг таарахгүй байна."];
  return { values, errors, valid: Object.keys(errors).length === 0 };
}

export function profileFieldErrors(mode: ProfileMode, errors: FieldErrors): FieldErrors {
  const messages: Record<string, string> = mode === "details" ? {
    name: "Нэрээ шалгаад дахин оруулна уу.", email: "Имэйл хаягаа шалгаад дахин оруулна уу.",
  } : {
    current_password: "Одоогийн нууц үг буруу байна.", password: "Шинэ нууц үг хамгийн багадаа 6 тэмдэгттэй байна.", password_confirmation: "Нууц үг таарахгүй байна.",
  };
  return Object.fromEntries(Object.entries(messages).filter(([key]) => errors[key]?.length).map(([key, message]) => {
    const duplicate = key === "email" && errors[key].some(value => /taken|already|бүртгэлтэй|ашиглагд/i.test(value));
    return [key, [duplicate ? "Энэ имэйл хаяг бүртгэлтэй байна." : message]];
  }));
}
