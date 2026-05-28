import { NextResponse } from "next/server";
import { extractUser } from "@/providers/auth-guard";
import { AppError } from "@/utils/errors";

export async function requireAuth(): Promise<string> {
  const user = await extractUser();
  if (!user) throw new AppError("UNAUTHORIZED", "Authentication required", 401);
  return user.userId;
}

export function handleError(err: unknown) {
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

export function ok(data: unknown, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created(data: unknown) {
  return NextResponse.json({ success: true, data }, { status: 201 });
}
