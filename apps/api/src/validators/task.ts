import { z } from "zod";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(300, "Title too long"),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  columnId: z.string().min(1, "Column is required"),
  dueDate: z.string().datetime().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(5000).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  dueDate: z.string().datetime().optional().nullable(),
});

export const assignMemberSchema = z.object({
  userId: z.string().min(1),
});

export const createSubTaskSchema = z.object({
  title: z.string().min(1).max(300),
});

export const updateSubTaskSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  completed: z.boolean().optional(),
});

export const moveTaskSchema = z.object({
  targetColumnId: z.string().min(1),
  position: z.number().int().min(0),
});

export const createLabelSchema = z.object({
  name: z.string().min(1).max(50),
  color: z.string().default("#6366f1"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
