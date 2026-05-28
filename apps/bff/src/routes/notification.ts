import { Hono } from "hono";
import { apiClient } from "@/services/apiClient";
import { authMiddleware } from "@/middleware/auth";

const notificationRoutes = new Hono();
notificationRoutes.use("*", authMiddleware);

function hdr(c: any) { return c.req.header("cookie") || ""; }

notificationRoutes.get("/", async (c) => {
  const q = new URLSearchParams(c.req.query()).toString();
  const res = await apiClient.get(`notifications${q ? `?${q}` : ""}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});

notificationRoutes.get("/unread-count", async (c) => {
  const res = await apiClient.get("notifications/unread-count", { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});

notificationRoutes.patch("/:id/read", async (c) => {
  const res = await apiClient.patch(`notifications/${c.req.param("id")}/read`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});

notificationRoutes.post("/read-all", async (c) => {
  const res = await apiClient.post("notifications/read-all", { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});

export { notificationRoutes };
