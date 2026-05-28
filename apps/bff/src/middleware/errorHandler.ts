import type { MiddlewareHandler } from "hono";

export const errorHandler: MiddlewareHandler = async (c, next) => {
  try {
    await next();
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    const status = (err as any)?.status || 500;

    return c.json(
      {
        success: false,
        error: {
          code: status >= 500 ? "INTERNAL_ERROR" : "REQUEST_ERROR",
          message,
        },
      },
      status,
    );
  }
};
