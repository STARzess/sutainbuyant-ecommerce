import "server-only";
import { redirect } from "next/navigation";
import { ApiError } from "./api-client";
import { apiBaseUrl } from "./api-server";
import { getSessionToken } from "./auth";
import { loginHref } from "./auth-validation";
import { createOrdersApiClient } from "./orders-api-client";

export function ordersApiClient() {
  return createOrdersApiClient(apiBaseUrl());
}

export async function getCustomerOrder(id: string) {
  const token = await getSessionToken();
  if (!token) redirect(loginHref(`/orders/${id}`));
  try { return await ordersApiClient().getOrder(token, id); }
  catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginHref(`/orders/${id}`));
    throw error;
  }
}
