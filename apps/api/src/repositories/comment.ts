import { prisma } from "@/providers/prisma";

export const commentRepository = {
  async findByTask(taskId: string) {
    return prisma.comment.findMany({
      where: { taskId },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
      orderBy: { createdAt: "asc" },
    });
  },

  async create(data: { taskId: string; userId: string; content: string }) {
    return prisma.comment.create({ data });
  },

  async findById(id: string) {
    return prisma.comment.findUnique({
      where: { id },
      include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } },
    });
  },

  async delete(id: string) {
    return prisma.comment.delete({ where: { id } });
  },
};
