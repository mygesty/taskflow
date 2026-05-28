import type { MiddlewareHandler } from "hono";

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json(
      {
        success: false,
        error: { code: "UNAUTHORIZED", message: "Missing or invalid token" },
      },
      401,
    );
  }

  // TODO: JWT verification with jose
  // const token = authHeader.slice(7);
  // const payload = await verifyJwt(token);

  await next();
};
