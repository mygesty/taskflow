import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { apiClient } from "@/services/apiClient";
import { authMiddleware } from "@/middleware/auth";

const boardRoutes = new Hono();
boardRoutes.use("*", authMiddleware);

const createBoardDTO = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(500).optional(),
  workspaceId: z.string(),
});

const createColumnDTO = z.object({ title: z.string().min(1).max(100) });
const updateColumnDTO = z.object({ title: z.string().min(1).max(100) });
const reorderDTO = z.object({ items: z.array(z.object({ id: z.string(), position: z.number() })) });

function cookieHeader(c: any) { return c.req.header("cookie") || ""; }

boardRoutes.get("/", async (c) => {
  const wsId = c.req.query("workspaceId");
  const res = await apiClient.get(`boards?workspaceId=${wsId}`, { headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.post("/", zValidator("json", createBoardDTO), async (c) => {
  const body = c.req.valid("json");
  const res = await apiClient.post("boards", { json: body, headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.get("/:id/detail", async (c) => {
  const id = c.req.param("id");
  const hdr = cookieHeader(c);
  const [boardRes, columnsRes] = await Promise.all([
    apiClient.get(`boards/${id}`, { headers: { cookie: hdr }, throwHttpErrors: false }),
    apiClient.get(`boards/${id}/columns`, { headers: { cookie: hdr }, throwHttpErrors: false }),
  ]);
  const boardData: any = await boardRes.json();
  const columnsData: any = await columnsRes.json();
  if (!boardRes.ok) { c.status(boardRes.status as any); return c.json(boardData); }
  return c.json({ success: true, data: { board: boardData.data, columns: columnsData.data || [] } });
});

boardRoutes.patch("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const res = await apiClient.patch(`boards/${id}`, { json: body, headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const res = await apiClient.delete(`boards/${id}`, { headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.get("/:id/columns", async (c) => {
  const id = c.req.param("id");
  const res = await apiClient.get(`boards/${id}/columns`, { headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.post("/:id/columns", zValidator("json", createColumnDTO), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const res = await apiClient.post(`boards/${id}/columns`, { json: body, headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.patch("/:id/columns/:columnId", zValidator("json", updateColumnDTO), async (c) => {
  const { id, columnId } = c.req.param();
  const body = c.req.valid("json");
  const res = await apiClient.patch(`boards/${id}/columns/${columnId}`, { json: body, headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.delete("/:id/columns/:columnId", async (c) => {
  const { id, columnId } = c.req.param();
  const res = await apiClient.delete(`boards/${id}/columns/${columnId}`, { headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

boardRoutes.patch("/:id/columns/reorder", zValidator("json", reorderDTO), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const res = await apiClient.patch(`boards/${id}/columns/reorder`, { json: body, headers: { cookie: cookieHeader(c) }, throwHttpErrors: false });
  const data: any = await res.json();
  c.status(res.status as any);
  return c.json(data);
});

export { boardRoutes };
