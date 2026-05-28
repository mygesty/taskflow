import { getAccessTokenCookie } from "@/utils/cookie";
import { verifyAccessToken } from "@/providers/jwt";
import { logger } from "@/providers/logger";

export interface AuthenticatedUser {
  userId: string;
}

export async function extractUser(): Promise<AuthenticatedUser | null> {
  try {
    const token = await getAccessTokenCookie();
    if (!token) return null;

    const payload = await verifyAccessToken(token);
    return { userId: payload.userId };
  } catch (err) {
    logger.warn({ err }, "Token extraction failed");
    return null;
  }
}
