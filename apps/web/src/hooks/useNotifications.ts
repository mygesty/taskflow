"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface Notification {
  id: string; type: string; title: string; content: string | null; read: boolean;
  taskId: string | null; createdAt: string;
  task?: { id: string; title: string } | null;
}

export function useUnreadCount(enabled = true) {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => apiClient.get("me/notifications/unread-count").json<{ success: boolean; data: { count: number } }>(),
    select: (r) => r.data.count,
    refetchInterval: 30_000,
    enabled,
  });
}

export function useNotifications(page = 1, enabled = true) {
  return useQuery({
    queryKey: ["notifications", page],
    queryFn: () => apiClient.get(`me/notifications?page=${page}&pageSize=20`).json<{
      success: boolean; data: { items: Notification[]; total: number; page: number; pageSize: number };
    }>(),
    select: (r) => r.data,
  });
}

export function useMarkRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.patch(`me/notifications/${id}/read`).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => apiClient.post("me/notifications/read-all").json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
