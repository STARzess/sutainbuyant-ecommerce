"use client";

import { useEffect, useRef, useState } from "react";
import type { FieldErrors } from "./api-client";

export function useApiForm<T>(endpoint: string) {
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [message, setMessage] = useState("");
  const active = useRef<AbortController | null>(null);
  useEffect(() => () => active.current?.abort(), []);

  function showValidation(nextErrors: FieldErrors) {
    setErrors(nextErrors);
    setMessage("Талбаруудын мэдээллийг шалгана уу.");
  }

  function clearField(name: string) {
    setErrors((current) => {
      if (!current[name]) return current;
      const remaining = { ...current };
      delete remaining[name];
      return remaining;
    });
    setMessage("");
  }

  async function submit(values: Record<string, unknown>): Promise<T | null> {
    if (active.current) return null;
    const controller = new AbortController();
    active.current = controller;
    setPending(true); setErrors({}); setMessage("");
    try {
      const response = await fetch(endpoint, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values), credentials: "same-origin", cache: "no-store",
        signal: AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]),
      });
      const body = await response.json();
      if (controller.signal.aborted) return null;
      if (!response.ok) {
        setErrors(body.errors && typeof body.errors === "object" ? body.errors : {});
        setMessage(typeof body.message === "string" ? body.message : "Хүсэлт амжилтгүй боллоо. Дахин оролдоно уу.");
        return null;
      }
      return body as T;
    } catch {
      if (!controller.signal.aborted) setMessage("Холболт амжилтгүй боллоо. Дахин оролдоно уу.");
      return null;
    } finally {
      if (!controller.signal.aborted) setPending(false);
      active.current = null;
    }
  }

  return { pending, errors, message, submit, clearField, showValidation };
}
