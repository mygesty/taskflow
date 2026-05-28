"use client";

import { useMutation } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuthStore } from "@/stores/auth-store";

interface AuthPayload {
  email: string;
  password: string;
  name?: string;
}

export function useRegister() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: AuthPayload) => {
      const res = await apiClient.post("auth/register", { json: payload });
      return res.json<{ success: boolean; data: { user: { id: string; email: string; name: string; avatarUrl: string | null } } }>();
    },
    onSuccess: (data) => {
      if (data.data?.user) setUser(data.data.user);
    },
  });
}

export function useLogin() {
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (payload: AuthPayload) => {
      const res = await apiClient.post("auth/login", { json: payload });
      return res.json<{ success: boolean; data: { user: { id: string; email: string; name: string; avatarUrl: string | null } } }>();
    },
    onSuccess: (data) => {
      if (data.data?.user) setUser(data.data.user);
    },
  });
}

export function useLogout() {
  const logout = useAuthStore((s) => s.logout);

  return useMutation({
    mutationFn: async () => {
      await apiClient.post("auth/logout");
    },
    onSuccess: () => {
      logout();
    },
  });
}
