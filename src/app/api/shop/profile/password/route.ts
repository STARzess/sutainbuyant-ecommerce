import type { NextRequest } from "next/server";
import { handleProfileMutation } from "@/lib/profile-handlers";

export function PUT(request: NextRequest) { return handleProfileMutation(request, "password"); }
