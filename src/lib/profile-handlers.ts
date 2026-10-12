import "server-only";
import type { NextRequest } from "next/server";
import { ApiError } from "./api-client";
import { privateJson } from "./api-response";
import { authApiClient } from "./auth";
import { SESSION_COOKIE } from "./auth-validation";
import { profileFieldErrors, validatePasswordValues, validateProfileValues, type ProfileMode } from "./profile-validation";
import { readJsonBody, sessionCookieOptions, verifyMutationOrigin } from "./request-security";

export async function handleProfileMutation(request: NextRequest, mode: ProfileMode) {
  try {
    verifyMutationOrigin(request);
    sessionCookieOptions(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return privateJson({ message: "Мэдээллээ өөрчлөхийн тулд нэвтэрнэ үү." }, 401);
    const input = await readJsonBody(request);
    const api = authApiClient();
    if (mode === "details") {
      const validation = validateProfileValues(input);
      if (!validation.valid) return privateJson({ message: "Талбаруудын мэдээллийг шалгана уу.", errors: validation.errors }, 422);
      return privateJson({ user: await api.updateProfile(token, validation.values) });
    }
    const validation = validatePasswordValues(input);
    if (!validation.valid) return privateJson({ message: "Талбаруудын мэдээллийг шалгана уу.", errors: validation.errors }, 422);
    await api.changePassword(token, validation.values);
    return privateJson({ message: "Нууц үг амжилттай солигдлоо." });
  } catch (error) {
    const code = error instanceof ApiError ? error.status : 500;
    const status = code >= 500 ? 503 : code;
    const messages: Record<number, string> = {
      400: "Хүсэлтийн мэдээлэл буруу байна.", 401: "Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
      403: "Хүсэлтийг зөвшөөрөх боломжгүй байна. Хуудсаа шинэчлээд дахин оролдоно уу.",
      413: "Хүсэлтийн мэдээлэл хэт их байна.", 415: "Хүсэлтийн хэлбэр буруу байна.",
      422: "Талбаруудын мэдээллийг шалгана уу.", 429: "Хэт олон удаа оролдсон байна. Түр хүлээгээд дахин оролдоно уу.",
    };
    const response = privateJson({ message: messages[status] ?? "Өөрчлөлтийг баталгаажуулж чадсангүй. Түр хүлээгээд мэдээллээ дахин шалгана уу.", errors: error instanceof ApiError && status === 422 ? profileFieldErrors(mode, error.errors) : {} }, status);
    if (status === 401) response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(request), maxAge: 0 });
    return response;
  }
}
