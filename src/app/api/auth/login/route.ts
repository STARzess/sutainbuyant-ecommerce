import type { NextRequest } from "next/server";
import { handleAuthentication } from "@/lib/auth-handlers";

export function POST(request: NextRequest) {
  return handleAuthentication(request, "login");
}
