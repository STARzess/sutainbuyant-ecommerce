import "server-only";
import { ApiError, createApiClient } from "./api-client";

export function apiBaseUrl() {
  const value = process.env.API_BASE_URL;
  if (!value) throw new ApiError(500);
  return value;
}

export function serverApiClient() {
  return createApiClient(apiBaseUrl());
}
