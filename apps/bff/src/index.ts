import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });
import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/errorHandler";
import { apiClient } from "./services/apiClient";
import { authRoutes } from "./routes/auth";
import { workspaceRoutes } from "./routes/workspace";
import { boardRoutes } from "./routes/board";
import { taskRoutes } from "./routes/task";
import { notificationRoutes } from "./routes/notification";

const labelsApp = new Hono();
labelsApp.use("*", async (c, next) => {
  const cookie = c.req.header("cookie") || "";
  const path = c.req.path.replace("/api/bff/labels", "labels");
  const qs = new URLSearchParams(c.req.query()).toString();
  const url = `${path}${qs ? `?${qs}` : ""}`;
  const method = c.req.method.toLowerCase() as "get" | "post";
  const body = method === "post" ? await c.req.json().catch(() => null) : undefined;
  const opts: any = { headers: { cookie }, throwHttpErrors: false };
  if (body) opts.json = body;
  const res = await apiClient[method](url, opts);
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

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

app.route("/api/bff/auth", authRoutes);
app.route("/api/bff/workspaces", workspaceRoutes);
app.route("/api/bff/boards", boardRoutes);
app.route("/api/bff/tasks", taskRoutes);
app.route("/api/bff/labels", labelsApp);
app.route("/api/bff/me/notifications", notificationRoutes);

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
