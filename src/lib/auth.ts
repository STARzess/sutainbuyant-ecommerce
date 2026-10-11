import "server-only";
import { cookies } from "next/headers";
import { cache } from "react";
import { redirect } from "next/navigation";
import { ApiError } from "./api-client";
import { apiBaseUrl } from "./api-server";
import { createAuthApiClient } from "./auth-api-client";
import { SESSION_COOKIE, loginHref } from "./auth-validation";

export function authApiClient() {
  return createAuthApiClient(apiBaseUrl());
}

// React cache deduplicates within one render only. User data never enters the shared shop cache.
export const getSessionUser = cache(async () => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try { return await authApiClient().getUser(token); }
  catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) return null;
    throw error;
  }
});

export async function requireUser(returnTo: string) {
  const user = await getSessionUser();
  if (!user) redirect(loginHref(returnTo));
  return user;
}
