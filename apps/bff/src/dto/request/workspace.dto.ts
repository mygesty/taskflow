import { z } from "zod";

export const createWorkspaceDTO = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export const updateWorkspaceDTO = z.object({
  name: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export const inviteMemberDTO = z.object({
  email: z.string().email(),
  role: z.enum(["OWNER", "ADMIN", "MEMBER"]).default("MEMBER"),
});

export const updateMemberRoleDTO = z.object({
  role: z.enum(["ADMIN", "MEMBER"]),
});

export type CreateWorkspaceInput = z.infer<typeof createWorkspaceDTO>;
export type UpdateWorkspaceInput = z.infer<typeof updateWorkspaceDTO>;
export type InviteMemberInput = z.infer<typeof inviteMemberDTO>;
export type UpdateMemberRoleInput = z.infer<typeof updateMemberRoleDTO>;
