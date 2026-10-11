export type FieldErrors = Record<string, string[]>;

export class ApiError extends Error {
  readonly status: number;
  readonly errors: FieldErrors;
  constructor(status: number, errors: FieldErrors = {}) {
    super("API request failed");
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export function apiRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError(502);
  return value as Record<string, unknown>;
}

function validationErrors(value: unknown): FieldErrors {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(Object.entries(value).slice(0, 30).flatMap(([key, messages]) => {
    if (!/^[a-z][a-z0-9_.]{0,80}$/i.test(key) || !Array.isArray(messages)) return [];
    const errors = messages.filter((item): item is string => typeof item === "string").slice(0, 3).map((item) => item.slice(0, 500));
    return errors.length ? [[key, errors]] : [];
  }));
}

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  data?: Record<string, unknown>;
  token?: string;
  allowMissing?: boolean;
};

export function createApiClient(baseUrl: string, fetcher: typeof fetch = fetch, timeoutMs = 10000) {
  let base: URL;
  try { base = new URL(baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`); } catch { throw new ApiError(500); }
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname);
  if ((base.protocol !== "https:" && !(local && base.protocol === "http:")) || base.username || base.password || base.search || base.hash) throw new ApiError(500);

  async function request(route: string, options: ApiRequestOptions = {}) {
    const url = new URL(route, base);
    if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname) || route.startsWith("/") || route.includes("\\")) throw new ApiError(500);
    if (options.token && !/^[!-~]{1,2048}$/.test(options.token)) throw new ApiError(401);
    const headers: Record<string, string> = { Accept: "application/json" };
    if (options.data) headers["Content-Type"] = "application/json";
    if (options.token) headers.Authorization = `Bearer ${options.token}`;
    let response: Response;
    try {
      response = await fetcher(url, {
        method: options.method ?? "GET", headers,
        body: options.data ? JSON.stringify(options.data) : undefined,
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(timeoutMs),
      });
    } catch { throw new ApiError(503); }
    if (options.allowMissing && response.status === 404) return null;
    let body: unknown;
    try { body = response.status === 204 ? {} : await response.json(); } catch {
      throw new ApiError(response.ok ? 502 : response.status);
    }
    if (!response.ok) {
      const errors = response.status === 422 && body && typeof body === "object" ? validationErrors((body as Record<string, unknown>).errors) : {};
      throw new ApiError(response.status, errors);
    }
    return apiRecord(body);
  }
  return { baseUrl: base.href, request };
}
