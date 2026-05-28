import { NextResponse } from "next/server";
import { authService } from "@/services/auth";
import { getRefreshTokenCookie, setAuthCookies } from "@/utils/cookie";
import { AppError } from "@/utils/errors";

export async function POST() {
  try {
    const token = await getRefreshTokenCookie();
    if (!token) {
      return NextResponse.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "No refresh token" } },
        { status: 401 },
      );
    }

    const result = await authService.refreshToken(token);
    await setAuthCookies(result.accessToken, result.refreshToken);

    return NextResponse.json(
      { success: true, data: { message: "Tokens refreshed" } },
      { status: 200 },
    );
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Token refresh failed" } },
      { status: 500 },
    );
  }
}
