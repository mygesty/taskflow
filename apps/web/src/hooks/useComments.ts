"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface Comment {
  id: string; taskId: string; userId: string; content: string; createdAt: string;
  user: { id: string; name: string; email: string; avatarUrl: string | null };
}

export function useComments(taskId: string) {
  return useQuery({
    queryKey: ["comments", taskId],
    queryFn: () => apiClient.get(`tasks/${taskId}/comments`).json<{ success: boolean; data: Comment[] }>(),
    select: (r) => r.data,
    enabled: !!taskId,
  });
}

export function useCreateComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { content: string }) =>
      apiClient.post(`tasks/${taskId}/comments`, { json: data }).json<{ success: boolean; data: Comment }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}

export function useDeleteComment(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) =>
      apiClient.delete(`tasks/${taskId}/comments/${commentId}`).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["comments", taskId] });
    },
  });
}
