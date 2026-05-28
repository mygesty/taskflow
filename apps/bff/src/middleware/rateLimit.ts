import type { MiddlewareHandler } from "hono";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

export const rateLimit = (options: { windowMs: number; max: number }): MiddlewareHandler => {
  return async (c, next) => {
    const ip = c.req.header("x-forwarded-for") || c.req.header("x-real-ip") || "unknown";
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetAt) {
      rateLimitMap.set(ip, { count: 1, resetAt: now + options.windowMs });
    } else {
      entry.count++;
      if (entry.count > options.max) {
        return c.json(
          {
            success: false,
            error: { code: "RATE_LIMITED", message: "Too many requests" },
          },
          429,
        );
      }
    }

    await next();
  };
};
