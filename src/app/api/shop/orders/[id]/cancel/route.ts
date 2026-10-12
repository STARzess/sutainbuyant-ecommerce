import type { NextRequest } from "next/server";
import { ApiError } from "@/lib/api-client";
import { privateJson } from "@/lib/api-response";
import { SESSION_COOKIE } from "@/lib/auth-validation";
import { ordersApiClient } from "@/lib/orders";
import { canCancelOrder, validOrderId } from "@/lib/orders-api-client";
import { readJsonBody, sessionCookieOptions, verifyMutationOrigin } from "@/lib/request-security";

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    verifyMutationOrigin(request);
    sessionCookieOptions(request);
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return privateJson({ message: "Захиалга цуцлахын тулд нэвтэрнэ үү." }, 401);
    const { id } = await context.params;
    if (!validOrderId(id)) return privateJson({ message: "Захиалгын дугаар буруу байна." }, 400);
    await readJsonBody(request, 1024);
    const api = ordersApiClient();
    const current = await api.getOrder(token, id);
    if (!current) return privateJson({ message: "Захиалга олдсонгүй." }, 404);
    if (current.status === "cancelled") return privateJson({ order: { id, status: "cancelled" } });
    if (!canCancelOrder(current.status)) return privateJson({ message: "Зөвхөн хүлээгдэж буй захиалгыг цуцлах боломжтой." }, 409);
    const order = await api.cancelOrder(token, id);
    return privateJson({ order });
  } catch (error) {
    const code = error instanceof ApiError ? error.status : 500;
    const status = code >= 500 ? 503 : code;
    const messages: Record<number, string> = {
      400: "Хүсэлтийн мэдээлэл буруу байна.", 401: "Нэвтрэх хугацаа дууссан байна. Дахин нэвтэрнэ үү.",
      403: "Хүсэлтийг зөвшөөрөх боломжгүй байна. Захиалгын төлөвийг дахин шалгана уу.",
      404: "Захиалга олдсонгүй.", 409: "Захиалгын төлөв өөрчлөгдсөн байна. Төлөвийг дахин шалгана уу.",
      413: "Хүсэлтийн мэдээлэл хэт их байна.", 415: "Хүсэлтийн хэлбэр буруу байна.",
      422: "Захиалгыг цуцлах боломжгүй байна. Төлөвийг дахин шалгана уу.",
      429: "Хэт олон удаа оролдсон байна. Түр хүлээгээд дахин оролдоно уу.",
    };
    const response = privateJson({ message: messages[status] ?? "Цуцлалтын төлөвийг баталгаажуулж чадсангүй. Хуудсаа шинэчлээд шалгана уу." }, status);
    if (status === 401) response.cookies.set(SESSION_COOKIE, "", { ...sessionCookieOptions(request), maxAge: 0 });
    return response;
  }
}
