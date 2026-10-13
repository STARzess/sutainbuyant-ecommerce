import "server-only";
import { ApiError } from "./api-client";

export function apiBaseUrl() {
  const environment = process.env;
  const value = environment.NEXT_PUBLIC_API_URL;
  if (!value) throw new ApiError(500);
  return value;
}
