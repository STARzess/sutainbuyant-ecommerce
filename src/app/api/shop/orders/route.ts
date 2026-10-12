import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-client";
import { privateJson } from "@/lib/api-response";
import { SESSION_COOKIE } from "@/lib/auth-validation";
import { checkoutFieldErrors, validateCheckout } from "@/lib/checkout";
import { ordersApiClient } from "@/lib/orders";
import { readJsonBody, sessionCookieOptions, verifyMutationOrigin } from "@/lib/request-security";

export async function POST(request: NextRequest) {
  try {
    verifyMutationOrigin(request);
    sessionCookieOptions(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return privateJson({ message: "Захиалга хийхийн тулд нэвтэрнэ үү.", errors: {} }, 401);
    const validation = validateCheckout(await readJsonBody(request, 32768));
    if (!validation.valid) return privateJson({ message: "Талбаруудын мэдээллийг шалгана уу.", errors: validation.errors }, 422);
    const order = await ordersApiClient().createOrder(token, validation.values);
    return privateJson({ order }, 201);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 500;
    const messages: Record<number, string> = {
      400: "Хүсэлтийн мэдээлэл буруу байна.", 401: "Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
      403: "Хүсэлтийг зөвшөөрөх боломжгүй байна. Хуудсаа шинэчлээд дахин оролдоно уу.",
      413: "Захиалгын мэдээлэл хэт их байна.", 415: "Хүсэлтийн хэлбэр буруу байна.",
      422: "Талбаруудын мэдээллийг шалгана уу.", 429: "Хэт олон удаа оролдсон байна. Түр хүлээгээд дахин оролдоно уу.",
    };
    const response = privateJson({
      message: messages[status] ?? "Захиалга бүртгэгдсэн эсэхийг баталгаажуулж чадсангүй. Дахин илгээхээс өмнө шалгана уу.",
      errors: error instanceof ApiError && status === 422 ? checkoutFieldErrors(error.errors) : {},
    }, status >= 500 ? 503 : status);
    if (status === 401) response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(request), maxAge: 0 });
    return response;
  }
}
