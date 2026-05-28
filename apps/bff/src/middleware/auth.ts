import type { MiddlewareHandler } from "hono";
import { jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET || "dev-secret-key-minimum-32-characters-long";
  return new TextEncoder().encode(secret);
}

function extractToken(c: Parameters<MiddlewareHandler>[0]): string | null {
  const cookieHeader = c.req.header("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)access_token=([^;]*)/);
    if (match?.[1]) return match[1];
  }

  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return null;
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = extractToken(c);
  if (!token) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Missing or invalid token" },
      },
      401,
    );
  }

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
    });
    c.set("user", { userId: payload.sub! });
  } catch {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Invalid or expired token" },
      },
      401,
    );
  }

  await next();
};
