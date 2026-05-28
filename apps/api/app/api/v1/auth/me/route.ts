import { NextResponse } from "next/server";
import { extractUser } from "@/providers/auth-guard";
import { userRepository } from "@/repositories/user";

export async function GET() {
  const authUser = await extractUser();
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "Not authenticated" } },
      { status: 401 },
    );
  }

  const user = await userRepository.findById(authUser.userId);
  if (!user) {
    return NextResponse.json(
      { success: false, error: { code: "UNAUTHORIZED", message: "User not found" } },
      { status: 401 },
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        createdAt: user.createdAt,
      },
    },
  });
}
