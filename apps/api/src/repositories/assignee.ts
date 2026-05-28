import { prisma } from "@/providers/prisma";

export const assigneeRepository = {
  async add(taskId: string, userId: string) {
    return prisma.taskAssignee.create({ data: { taskId, userId } });
  },

  async remove(taskId: string, userId: string) {
    return prisma.taskAssignee.delete({
      where: { taskId_userId: { taskId, userId } },
    });
  },

  async findByTask(taskId: string) {
    return prisma.taskAssignee.findMany({
      where: { taskId },
      include: { user: true },
    });
  },
};
