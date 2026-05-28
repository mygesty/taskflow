import { NextResponse } from "next/server";
import { authService } from "@/services/auth";
import { setAuthCookies } from "@/utils/cookie";
import { AppError } from "@/utils/errors";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await authService.register(body);
    await setAuthCookies(result.accessToken, result.refreshToken);

    return NextResponse.json(
      { success: true, data: { user: result.user } },
      { status: 201 },
    );
  } catch (err) {
    if (err instanceof AppError) {
      return NextResponse.json(
        { success: false, error: { code: err.code, message: err.message } },
        { status: err.statusCode },
      );
    }
    return NextResponse.json(
      { success: false, error: { code: "VALIDATION_ERROR", message: (err as Error).message } },
      { status: 400 },
    );
  }
}
