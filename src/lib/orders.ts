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

async function withOrderSession<T>(returnTo: string, operation: (api: ReturnType<typeof ordersApiClient>, token: string) => Promise<T>) {
  const token = await getSessionToken();
  if (!token) redirect(loginHref(returnTo));
  try { return await operation(ordersApiClient(), token); }
  catch (error) {
    if (error instanceof ApiError && error.status === 401) redirect(loginHref(returnTo));
    throw error;
  }
}

export function getCustomerOrder(id: string) {
  return withOrderSession(`/orders/${id}`, (api, token) => api.getOrder(token, id));
}

export function getCustomerOrders() {
  return withOrderSession("/orders", (api, token) => api.getOrders(token));
}
