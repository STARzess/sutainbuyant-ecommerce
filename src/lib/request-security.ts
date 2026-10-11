import { ApiError } from "./api-client";

function requestOrigin(request: Request) {
  const url = new URL(request.url);
  // Next normalizes loopback URLs; Host retains the address the browser requested.
  const host = request.headers.get("host") ?? url.host;
  try {
    const origin = new URL(`${url.protocol}//${host}`);
    if (origin.host.toLowerCase() !== host.toLowerCase() || origin.username || origin.password) throw new ApiError(400);
    return origin;
  } catch { throw new ApiError(400); }
}

export function verifyMutationOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  if (!origin || origin !== requestOrigin(request).origin || (site && site !== "same-origin" && site !== "none")) throw new ApiError(403);
}

export function sessionCookieOptions(request: Request) {
  const url = requestOrigin(request);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (url.protocol !== "https:" && !local) throw new ApiError(400);
  return { httpOnly: true, secure: url.protocol === "https:", sameSite: "lax" as const, path: "/", maxAge: 7 * 24 * 60 * 60 };
}

export async function readJsonBody(request: Request, maximum = 16384): Promise<unknown> {
  if (request.headers.get("content-type")?.split(";")[0].trim().toLowerCase() !== "application/json") throw new ApiError(415);
  if (!request.body || Number(request.headers.get("content-length")) > maximum) throw new ApiError(413);
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maximum) { await reader.cancel(); throw new ApiError(413); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return JSON.parse(new TextDecoder().decode(bytes)); } catch { throw new ApiError(400); }
}
