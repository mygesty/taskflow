import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { errorHandler } from "./middleware/errorHandler";
import { authMiddleware } from "./middleware/auth";

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

app.get("/api/bff/health", (c) => {
  return c.json({ status: "ok", timestamp: new Date().toISOString() });
});

const port = Number(process.env.BFF_PORT) || 3002;
console.log(`BFF server starting on port ${port}`);

export default app;

import { serve } from "@hono/node-server";
serve({ fetch: app.fetch, port });
