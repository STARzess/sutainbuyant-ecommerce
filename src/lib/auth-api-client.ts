import { ApiError, apiRecord, createApiClient } from "./api-client";
import type { ProfileValues, PasswordValues } from "./profile-validation";
import type { AuthMode, AuthValues, SessionUser } from "./auth-validation";

export function mapSessionUser(value: unknown): SessionUser {
  const user = apiRecord(value);
  const id = String(user.id ?? "");
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id)) || (typeof user.name !== "string" && user.name !== null) || (typeof user.email !== "string" && user.email !== null)) throw new ApiError(502);
  return { id, name: typeof user.name === "string" && user.name.trim() ? user.name : "Хэрэглэгч", email: typeof user.email === "string" ? user.email : "" };
}

export function createAuthApiClient(baseUrl: string, fetcher: typeof fetch = fetch, timeoutMs = 10000) {
  const api = createApiClient(baseUrl, fetcher, timeoutMs);
  return {
    async authenticate(mode: AuthMode, values: AuthValues) {
      const body = await api.request(mode, { method: "POST", data: values });
      if (!body || typeof body.token !== "string" || !/^[!-~]{1,2048}$/.test(body.token) || body.token_type !== "Bearer") throw new ApiError(502);
      return { token: body.token, user: mapSessionUser(body.user) };
    },
    async getUser(token: string) {
      const body = await api.request("shop/profile", { token });
      return mapSessionUser(body?.data);
    },
    async updateProfile(token: string, values: ProfileValues) {
      const body = await api.request("shop/profile", { method: "PUT", token, data: { name: values.name, email: values.email } });
      return mapSessionUser(body?.data);
    },
    async changePassword(token: string, values: PasswordValues) {
      const body = await api.request("shop/profile/password", { method: "PUT", token, data: { current_password: values.current_password, password: values.password, password_confirmation: values.password_confirmation } });
      if (typeof body?.message !== "string") throw new ApiError(502);
    },
    async logout(token: string) {
      try { await api.request("logout", { method: "POST", token }); }
      catch (error) { if (!(error instanceof ApiError) || error.status !== 401) throw error; }
    },
  };
}
