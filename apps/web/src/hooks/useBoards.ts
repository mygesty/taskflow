"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { queryKeys } from "@/lib/query-keys";

interface Board {
  id: string; title: string; description: string | null; workspaceId: string;
  columns?: BoardColumn[];
}
interface BoardColumn {
  id: string; boardId: string; title: string; position: number;
  tasks?: { id: string; title: string }[];
}

export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.boards.all(workspaceId),
    queryFn: () => apiClient.get(`boards?workspaceId=${workspaceId}`).json<{ success: boolean; data: Board[] }>(),
    select: (res) => res.data,
    enabled: !!workspaceId,
  });
}

export function useBoardDetail(boardId: string) {
  return useQuery({
    queryKey: queryKeys.boards.detail(boardId),
    queryFn: () => apiClient.get(`boards/${boardId}/detail`).json<{ success: boolean; data: { board: Board; columns: BoardColumn[] } }>(),
    select: (res) => res.data,
    enabled: !!boardId,
  });
}

export function useCreateBoard() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string; description?: string; workspaceId: string }) =>
      apiClient.post("boards", { json: data }).json<{ success: boolean; data: Board }>(),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: queryKeys.boards.all(vars.workspaceId) });
    },
  });
}

export function useDeleteBoard(workspaceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (boardId: string) => apiClient.delete(`boards/${boardId}`).json<{ success: boolean }>(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boards.all(workspaceId) }),
  });
}

export function useAddColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { title: string }) => apiClient.post(`boards/${boardId}/columns`, { json: data }).json<{ success: boolean; data: BoardColumn }>(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) }),
  });
}

export function useDeleteColumn(boardId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ columnId }: { boardId: string; columnId: string }) =>
      apiClient.delete(`boards/${boardId}/columns/${columnId}`).json<{ success: boolean }>(),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.boards.detail(boardId) }),
  });
}
