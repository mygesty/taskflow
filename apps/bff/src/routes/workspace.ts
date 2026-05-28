import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createWorkspaceDTO, updateWorkspaceDTO, inviteMemberDTO, updateMemberRoleDTO } from "@/dto/request/workspace.dto";
import { apiClient } from "@/services/apiClient";
import { authMiddleware } from "@/middleware/auth";

const workspaceRoutes = new Hono();

// All workspace routes require auth
workspaceRoutes.use("*", authMiddleware);

workspaceRoutes.get("/", async (c) => {
  const response = await apiClient.get("workspaces", {
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.post("/", zValidator("json", createWorkspaceDTO), async (c) => {
  const body = c.req.valid("json");
  const response = await apiClient.post("workspaces", {
    json: body,
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.get("/:id/overview", async (c) => {
  const id = c.req.param("id");
  const cookieHeader = c.req.header("cookie") || "";

  const [wsRes, membersRes] = await Promise.all([
    apiClient.get(`workspaces/${id}`, { headers: { cookie: cookieHeader }, throwHttpErrors: false }),
    apiClient.get(`workspaces/${id}/members`, { headers: { cookie: cookieHeader }, throwHttpErrors: false }),
  ]);

  const wsData = await wsRes.json() as any;
  const membersData = await membersRes.json() as any;

  if (!wsRes.ok) {
    c.status(wsRes.status as any);
    return c.json(wsData);
  }

  return c.json({
    success: true,
    data: {
      workspace: wsData.data,
      members: membersData.data || [],
    },
  });
});

workspaceRoutes.patch("/:id", zValidator("json", updateWorkspaceDTO), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const response = await apiClient.patch(`workspaces/${id}`, {
    json: body,
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.delete("/:id", async (c) => {
  const id = c.req.param("id");
  const response = await apiClient.delete(`workspaces/${id}`, {
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.get("/:id/members", async (c) => {
  const id = c.req.param("id");
  const response = await apiClient.get(`workspaces/${id}/members`, {
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.post("/:id/members", zValidator("json", inviteMemberDTO), async (c) => {
  const id = c.req.param("id");
  const body = c.req.valid("json");
  const response = await apiClient.post(`workspaces/${id}/members`, {
    json: body,
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.patch("/:id/members/:memberId", zValidator("json", updateMemberRoleDTO), async (c) => {
  const id = c.req.param("id");
  const memberId = c.req.param("memberId");
  const body = c.req.valid("json");
  const response = await apiClient.patch(`workspaces/${id}/members/${memberId}`, {
    json: body,
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

workspaceRoutes.delete("/:id/members/:memberId", async (c) => {
  const id = c.req.param("id");
  const memberId = c.req.param("memberId");
  const response = await apiClient.delete(`workspaces/${id}/members/${memberId}`, {
    headers: { cookie: c.req.header("cookie") || "" },
    throwHttpErrors: false,
  });
  const data = await response.json();
  c.status(response.status as any);
  return c.json(data);
});

export { workspaceRoutes };
