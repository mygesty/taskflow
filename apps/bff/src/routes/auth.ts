import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { registerDTO, loginDTO } from "@/dto/request/auth.dto";
import { apiClient } from "@/services/apiClient";

const authRoutes = new Hono();

authRoutes.post("/register", zValidator("json", registerDTO), async (c) => {
  const body = c.req.valid("json");

  const response = await apiClient.post("auth/register", {
    json: body,
  });

  const data = await response.json<{
    success: boolean;
    data?: { user: { id: string; email: string; name: string; avatarUrl: string | null; createdAt: string } };
    error?: { code: string; message: string };
  }>();

  if (!response.ok) {
    c.status(response.status as any);
    return c.json(data);
  }

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    c.header("set-cookie", setCookie);
  }

  return c.json(data, 201);
});

authRoutes.post("/login", zValidator("json", loginDTO), async (c) => {
  const body = c.req.valid("json");

  const response = await apiClient.post("auth/login", {
    json: body,
  });

  const data = await response.json<{
    success: boolean;
    data?: { user: { id: string; email: string; name: string; avatarUrl: string | null; createdAt: string } };
    error?: { code: string; message: string };
  }>();

  if (!response.ok) {
    c.status(response.status as any);
    return c.json(data);
  }

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    c.header("set-cookie", setCookie);
  }

  return c.json(data);
});

authRoutes.post("/refresh", async (c) => {
  const cookieHeader = c.req.header("cookie");
  const response = await apiClient.post("auth/refresh", {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
  });

  const data = await response.json<{
    success: boolean;
    data?: { message: string };
    error?: { code: string; message: string };
  }>();

  if (!response.ok) {
    c.status(response.status as any);
    return c.json(data);
  }

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    c.header("set-cookie", setCookie);
  }

  return c.json(data);
});

authRoutes.get("/me", async (c) => {
  const cookieHeader = c.req.header("cookie");
  try {
    const response = await apiClient.get("auth/me", {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
      throwHttpErrors: false,
    });

    const data = await response.json<{
      success: boolean;
      data?: { user: { id: string; email: string; name: string; avatarUrl: string | null; createdAt: string } };
      error?: { code: string; message: string };
    }>();

    c.status(response.status as any);
    return c.json(data);
  } catch {
    return c.json(
      { success: false, error: { code: "INTERNAL_ERROR", message: "Failed to verify auth" } },
      502,
    );
  }
});

authRoutes.post("/logout", async (c) => {
  const response = await apiClient.post("auth/logout");

  const data = await response.json<{
    success: boolean;
    data?: { message: string };
  }>();

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    c.header("set-cookie", setCookie);
  }

  return c.json(data);
});

export { authRoutes };
