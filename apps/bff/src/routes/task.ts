import { Hono } from "hono";
import { apiClient } from "@/services/apiClient";
import { authMiddleware } from "@/middleware/auth";

const taskRoutes = new Hono();
taskRoutes.use("*", authMiddleware);

function hdr(c: any) { return c.req.header("cookie") || ""; }

taskRoutes.get("/", async (c) => {
  const q = new URLSearchParams(c.req.query()).toString();
  const res = await apiClient.get(`tasks?${q}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.post("/", async (c) => {
  const body = await c.req.json();
  const res = await apiClient.post("tasks", { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.get("/:id", async (c) => {
  const res = await apiClient.get(`tasks/${c.req.param("id")}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.patch("/:id", async (c) => {
  const body = await c.req.json();
  const res = await apiClient.patch(`tasks/${c.req.param("id")}`, { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.delete("/:id", async (c) => {
  const res = await apiClient.delete(`tasks/${c.req.param("id")}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.patch("/:id/move", async (c) => {
  const body = await c.req.json();
  const res = await apiClient.patch(`tasks/${c.req.param("id")}/move`, { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.post("/:id/assignees", async (c) => {
  const body = await c.req.json();
  const res = await apiClient.post(`tasks/${c.req.param("id")}/assignees`, { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.delete("/:id/assignees/:userId", async (c) => {
  const { id, userId } = c.req.param();
  const res = await apiClient.delete(`tasks/${id}/assignees/${userId}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.get("/:id/subtasks", async (c) => {
  const res = await apiClient.get(`tasks/${c.req.param("id")}/subtasks`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.post("/:id/subtasks", async (c) => {
  const body = await c.req.json();
  const res = await apiClient.post(`tasks/${c.req.param("id")}/subtasks`, { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.patch("/:id/subtasks/:subId", async (c) => {
  const body = await c.req.json();
  const { id, subId } = c.req.param();
  const res = await apiClient.patch(`tasks/${id}/subtasks/${subId}`, { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.delete("/:id/subtasks/:subId", async (c) => {
  const { id, subId } = c.req.param();
  const res = await apiClient.delete(`tasks/${id}/subtasks/${subId}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.get("/:id/labels", async (c) => {
  const res = await apiClient.get(`tasks/${c.req.param("id")}/labels`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.post("/:id/labels", async (c) => {
  const body = await c.req.json();
  const res = await apiClient.post(`tasks/${c.req.param("id")}/labels`, { json: body, headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});
taskRoutes.delete("/:id/labels/:labelId", async (c) => {
  const { id, labelId } = c.req.param();
  const res = await apiClient.delete(`tasks/${id}/labels/${labelId}`, { headers: { cookie: hdr(c) }, throwHttpErrors: false });
  const data: any = await res.json(); c.status(res.status as any); return c.json(data);
});

export { taskRoutes };
