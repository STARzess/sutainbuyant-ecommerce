"use client";

import { useId, useState, type ChangeEvent, type RefObject } from "react";
import { useRouter } from "next/navigation";
import { loginHref } from "./auth-validation";
import { useApiForm } from "./use-api-form";

export function useAccountForm<T>(endpoint: string, formRef: RefObject<HTMLFormElement | null>) {
  const router = useRouter();
  const formId = useId();
  const [success, setSuccess] = useState("");
  const api = useApiForm<T>(endpoint, { method: "PUT", onError: status => {
    if (status === 401) { router.replace(loginHref("/account")); router.refresh(); }
  }, networkErrorMessage: "Өөрчлөлтийг баталгаажуулж чадсангүй. Түр хүлээгээд мэдээллээ дахин шалгана уу." });

  function focusError() {
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus());
  }
  function onChange(event: ChangeEvent<HTMLFormElement>) {
    setSuccess("");
    if (event.target instanceof HTMLInputElement) api.clearField(event.target.name);
  }
  return { ...api, formId, success, setSuccess, focusError, onChange, refresh: router.refresh };
}
