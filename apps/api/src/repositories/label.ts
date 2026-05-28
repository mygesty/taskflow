import { prisma } from "@/providers/prisma";

export const labelRepository = {
  async findByWorkspace(workspaceId: string) {
    return prisma.label.findMany({ where: { workspaceId } });
  },

  async create(data: { workspaceId: string; name: string; color: string }) {
    return prisma.label.create({ data });
  },

  async addToTask(taskId: string, labelId: string) {
    return prisma.taskLabel.create({ data: { taskId, labelId } });
  },

  async removeFromTask(taskId: string, labelId: string) {
    return prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  },

  async findByTask(taskId: string) {
    return prisma.taskLabel.findMany({
      where: { taskId },
      include: { label: true },
    });
  },
};
