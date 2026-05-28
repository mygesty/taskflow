import { NextResponse } from "next/server";
import { clearAuthCookies } from "@/utils/cookie";

export async function POST() {
  await clearAuthCookies();
  return NextResponse.json(
    { success: true, data: { message: "Logged out" } },
    { status: 200 },
  );
}
