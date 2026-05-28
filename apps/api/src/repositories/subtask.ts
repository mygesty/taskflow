import { prisma } from "@/providers/prisma";

export const subTaskRepository = {
  async findByTask(taskId: string) {
    return prisma.subTask.findMany({ where: { taskId }, orderBy: { id: "asc" } });
  },

  async create(data: { taskId: string; title: string }) {
    return prisma.subTask.create({ data });
  },

  async update(id: string, data: { title?: string; completed?: boolean }) {
    return prisma.subTask.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.subTask.delete({ where: { id } });
  },
};
