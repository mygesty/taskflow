import { prisma } from "@/providers/prisma";
import type { Workspace, WorkspaceMember } from "@prisma/client";

export const workspaceRepository = {
  async findUserWorkspaces(userId: string) {
    return prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: { members: { include: { user: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.workspace.findUnique({
      where: { id },
      include: { members: { include: { user: true } } },
    });
  },

  async create(data: { name: string; description?: string }) {
    return prisma.workspace.create({ data });
  },

  async update(id: string, data: { name?: string; description?: string }) {
    return prisma.workspace.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.workspace.delete({ where: { id } });
  },

  async findMembers(workspaceId: string) {
    return prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true },
      orderBy: { joinedAt: "asc" },
    });
  },

  async addMember(workspaceId: string, userId: string, role: string) {
    return prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
    });
  },

  async updateMemberRole(memberId: string, role: string) {
    return prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
    });
  },

  async removeMember(memberId: string) {
    return prisma.workspaceMember.delete({ where: { id: memberId } });
  },

  async findMembership(workspaceId: string, userId: string) {
    return prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId, userId } },
    });
  },
};
