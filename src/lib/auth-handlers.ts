import "server-only";
import { NextRequest } from "next/server";
import { privateJson } from "./api-response";
import { ApiError } from "./api-client";
import { authApiClient } from "./auth";
import { SESSION_COOKIE, authFieldErrors, validateAuthValues, type AuthMode } from "./auth-validation";
import { readJsonBody, sessionCookieOptions, verifyMutationOrigin } from "./request-security";

function authError(error: unknown, mode?: AuthMode) {
  const status = error instanceof ApiError ? error.status : 500;
  const messages: Record<number, string> = {
    400: "Хүсэлтийн мэдээлэл буруу байна.", 401: "Имэйл хаяг эсвэл нууц үг буруу байна.",
    403: "Хүсэлтийг зөвшөөрөх боломжгүй байна. Хуудсаа шинэчлээд дахин оролдоно уу.",
    413: "Хүсэлтийн мэдээлэл хэт их байна.", 415: "Хүсэлтийн хэлбэр буруу байна.",
    422: "Талбаруудын мэдээллийг шалгана уу.", 429: "Хэт олон удаа оролдсон байна. Түр хүлээгээд дахин оролдоно уу.",
  };
  return privateJson({
    message: messages[status] ?? "Холболт амжилтгүй боллоо. Түр хүлээгээд дахин оролдоно уу.",
    errors: error instanceof ApiError && status === 422 && mode ? authFieldErrors(mode, error.errors) : {},
  }, status >= 500 ? 503 : status);
}

export async function handleAuthentication(request: NextRequest, mode: AuthMode) {
  try {
    verifyMutationOrigin(request);
    const options = sessionCookieOptions(request);
    const validation = validateAuthValues(mode, await readJsonBody(request));
    if (!validation.valid) return privateJson({ message: "Талбаруудын мэдээллийг шалгана уу.", errors: validation.errors }, 422);
    const session = await authApiClient().authenticate(mode, validation.values);
    const response = privateJson({ user: session.user });
    response.cookies.set(SESSION_COOKIE, session.token, options);
    return response;
  } catch (error) { return authError(error, mode); }
}

export async function handleLogout(request: NextRequest) {
  try {
    verifyMutationOrigin(request);
    const options = sessionCookieOptions(request);
    const input = await readJsonBody(request, 1024);
    if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApiError(400);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    let revocationConfirmed = true;
    if (token) {
      try { await authApiClient().logout(token); }
      catch { revocationConfirmed = false; }
    }
    const response = privateJson({
      message: revocationConfirmed ? "Амжилттай гарлаа." : "Энэ төхөөрөмжөөс гарлаа. Сервер дээрх нэвтрэх эрхийг цуцалсныг баталгаажуулж чадсангүй.",
      revocationConfirmed,
    });
    response.cookies.set(SESSION_COOKIE, "", { ...options, maxAge: 0 });
    return response;
  } catch (error) { return authError(error); }
}

export async function handleSession(request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return privateJson({ user: null });
  try { return privateJson({ user: await authApiClient().getUser(token) }); }
  catch (error) {
    if (error instanceof ApiError && [401, 403].includes(error.status)) {
      const response = privateJson({ user: null }, 401);
      response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(request), maxAge: 0 });
      return response;
    }
    return authError(error);
  }
}
