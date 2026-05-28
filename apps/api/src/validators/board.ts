import { z } from "zod";

export const createBoardSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  description: z.string().max(500).optional(),
  workspaceId: z.string().min(1, "Workspace is required"),
});

export const updateBoardSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
});

export const createColumnSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
});

export const updateColumnSchema = z.object({
  title: z.string().min(1).max(100).optional(),
});

export const reorderColumnsSchema = z.object({
  items: z.array(z.object({
    id: z.string(),
    position: z.number().int().min(0),
  })),
});

export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type ReorderColumnsInput = z.infer<typeof reorderColumnsSchema>;
