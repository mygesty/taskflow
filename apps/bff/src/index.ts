import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";
import { apiClient } from "./services/apiClient";

const app = new Hono();

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: process.env.WEB_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use("*", errorHandler);

app.get("/api/bff/health", async (c) => {
  try {
    const backendHealth = await apiClient.get("health").json<{
      success: boolean;
      data: Record<string, unknown>;
    }>();

    return c.json({
      success: true,
      data: {
        bff: "ok",
        backend: backendHealth.data,
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    return c.json(
      {
        success: false,
        data: {
          bff: "ok",
          backend: "unreachable",
          timestamp: new Date().toISOString(),
        },
      },
      502,
    );
  }
});

const port = Number(process.env.BFF_PORT) || 3002;
console.log(`BFF server starting on port ${port}`);

export default app;

import { serve } from "@hono/node-server";
serve({ fetch: app.fetch, port });
