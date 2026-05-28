"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface Workspace {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  members?: Member[];
}

interface Member {
  id: string;
  userId: string;
  role: string;
  user: { id: string; email: string; name: string; avatarUrl: string | null };
}

export function useWorkspaces(enabled = true) {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: () => apiClient.get("workspaces").json<{ success: boolean; data: Workspace[] }>(),
    select: (res) => res.data,
    enabled,
  });
}

export function useWorkspaceOverview(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.workspaces.overview(workspaceId),
    queryFn: () =>
      apiClient
        .get(`workspaces/${workspaceId}/overview`)
        .json<{ success: boolean; data: { workspace: Workspace; members: Member[] } }>(),
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; description?: string }) =>
      apiClient.post("workspaces", { json: data }).json<{ success: boolean; data: Workspace }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiClient.delete(`workspaces/${id}`).json<{ success: boolean }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
  });
}

export function useInviteMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { email: string; role?: string }) =>
      apiClient.post(`workspaces/${workspaceId}/members`, { json: data }).json<{ success: boolean }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.overview(workspaceId) });
    },
  });
}

export function useUpdateMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: string }) =>
      apiClient.patch(`workspaces/${workspaceId}/members/${memberId}`, { json: { role } }).json<{ success: boolean }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.overview(workspaceId) });
    },
  });
}

export function useRemoveMember(workspaceId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) =>
      apiClient.delete(`workspaces/${workspaceId}/members/${memberId}`).json<{ success: boolean }>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.overview(workspaceId) });
    },
  });
}
