import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateRoleSchema,
} from "@/validators/workspace";
import { workspaceRepository } from "@/repositories/workspace";
import { userRepository } from "@/repositories/user";
import { forbiddenError, notFoundError, conflictError } from "@/utils/errors";

export const workspaceService = {
  async createWorkspace(userId: string, input: { name: string; description?: string }) {
    const data = createWorkspaceSchema.parse(input);
    const workspace = await workspaceRepository.create({ name: data.name, description: data.description });
    await workspaceRepository.addMember(workspace.id, userId, "OWNER");
    return workspaceRepository.findById(workspace.id);
  },

  async listWorkspaces(userId: string) {
    return workspaceRepository.findUserWorkspaces(userId);
  },

  async getWorkspace(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership) throw forbiddenError("You are not a member of this workspace");

    return workspaceRepository.findById(workspaceId);
  },

  async updateWorkspace(workspaceId: string, userId: string, input: { name?: string; description?: string }) {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      throw forbiddenError("Only Owner or Admin can update workspace");
    }

    const data = updateWorkspaceSchema.parse(input);
    return workspaceRepository.update(workspaceId, data);
  },

  async deleteWorkspace(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership || membership.role !== "OWNER") {
      throw forbiddenError("Only Owner can delete workspace");
    }

    await workspaceRepository.delete(workspaceId);
  },

  async inviteMember(workspaceId: string, operatorId: string, input: { email: string; role?: string }) {
    const membership = await workspaceRepository.findMembership(workspaceId, operatorId);
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      throw forbiddenError("Only Owner or Admin can invite members");
    }

    const data = inviteMemberSchema.parse(input);
    const targetUser = await userRepository.findByEmail(data.email);
    if (!targetUser) throw notFoundError("User not found");

    const existing = await workspaceRepository.findMembership(workspaceId, targetUser.id);
    if (existing) throw conflictError("User is already a member");

    const members = await workspaceRepository.findMembers(workspaceId);
    if (members.length >= 50) throw conflictError("Workspace has reached maximum members (50)");

    await workspaceRepository.addMember(workspaceId, targetUser.id, data.role);
    return workspaceRepository.findMembers(workspaceId);
  },

  async updateMemberRole(workspaceId: string, operatorId: string, memberId: string, input: { role: string }) {
    const membership = await workspaceRepository.findMembership(workspaceId, operatorId);
    if (!membership || membership.role !== "OWNER") {
      throw forbiddenError("Only Owner can change member roles");
    }

    const data = updateRoleSchema.parse(input);
    return workspaceRepository.updateMemberRole(memberId, data.role);
  },

  async removeMember(workspaceId: string, operatorId: string, memberId: string) {
    const membership = await workspaceRepository.findMembership(workspaceId, operatorId);
    if (!membership || !["OWNER", "ADMIN"].includes(membership.role)) {
      throw forbiddenError("Only Owner or Admin can remove members");
    }

    await workspaceRepository.removeMember(memberId);
  },

  async leaveWorkspace(workspaceId: string, userId: string) {
    const membership = await workspaceRepository.findMembership(workspaceId, userId);
    if (!membership) throw notFoundError("You are not a member of this workspace");

    if (membership.role === "OWNER") {
      throw forbiddenError("Owner cannot leave workspace. Transfer ownership or delete it.");
    }

    await workspaceRepository.removeMember(membership.id);
  },
};
