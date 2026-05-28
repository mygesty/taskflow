"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface Task {
  id: string; columnId: string; title: string; description: string | null;
  priority: string; position: number; dueDate: string | null; createdAt: string;
  assignees?: { user: { id: string; name: string; email: string; avatarUrl: string | null } }[];
  labels?: { label: { id: string; name: string; color: string } }[];
  subTasks?: { id: string; title: string; completed: boolean }[];
}

export function useTasks(boardId?: string, columnId?: string) {
  const params = new URLSearchParams();
  if (boardId) params.set("boardId", boardId);
  if (columnId) params.set("columnId", columnId);
  return useQuery({
    queryKey: queryKeys.tasks.all(boardId),
    queryFn: () => apiClient.get(`tasks?${params}`).json<{ success: boolean; data: Task[] }>(),
    select: (r) => r.data,
    enabled: !!(boardId || columnId),
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; priority?: string; columnId: string; dueDate?: string }) =>
      apiClient.post("tasks", { json: data }).json<{ success: boolean; data: Task }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: { id: string; title?: string; description?: string; priority?: string; dueDate?: string | null }) =>
      apiClient.patch(`tasks/${id}`, { json: data }).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.refetchQueries({ queryKey: ["boards"] });
      qc.refetchQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`tasks/${id}`).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useAssignMember(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.post(`tasks/${taskId}/assignees`, { json: { userId } }).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.refetchQueries({ queryKey: ["boards"] });
      qc.refetchQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useRemoveAssignee(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      apiClient.delete(`tasks/${taskId}/assignees/${userId}`).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.refetchQueries({ queryKey: ["boards"] });
      qc.refetchQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useMoveTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ taskId, ...data }: { taskId: string; targetColumnId: string; position: number }) =>
      apiClient.patch(`tasks/${taskId}/move`, { json: data }).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useAddSubTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string }) =>
      apiClient.post(`tasks/${taskId}/subtasks`, { json: data }).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useUpdateSubTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ subId, ...data }: { subId: string; title?: string; completed?: boolean }) =>
      apiClient.patch(`tasks/${taskId}/subtasks/${subId}`, { json: data }).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useDeleteSubTask(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (subId: string) =>
      apiClient.delete(`tasks/${taskId}/subtasks/${subId}`).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
    },
  });
}

export function useLabels(workspaceId: string) {
  return useQuery({
    queryKey: ["labels", workspaceId],
    queryFn: () => apiClient.get(`labels?workspaceId=${workspaceId}`).json<{ success: boolean; data: { id: string; name: string; color: string }[] }>(),
    select: (r) => r.data,
    enabled: !!workspaceId,
  });
}

export function useAddLabel(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; color?: string }) =>
      apiClient.post(`tasks/${taskId}/labels`, { json: data }).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}

export function useRemoveLabel(taskId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (labelId: string) =>
      apiClient.delete(`tasks/${taskId}/labels/${labelId}`).json<{ success: boolean }>(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["boards"] });
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["labels"] });
    },
  });
}
