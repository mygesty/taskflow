import { prisma } from "@/providers/prisma";

export const taskRepository = {
  async findByColumn(columnId: string) {
    return prisma.task.findMany({
      where: { columnId },
      include: { assignees: { include: { user: true } }, labels: { include: { label: true } }, subTasks: true },
      orderBy: { position: "asc" },
    });
  },

  async findByBoard(boardId: string) {
    return prisma.task.findMany({
      where: { column: { boardId } },
      include: { assignees: { include: { user: true } }, labels: { include: { label: true } }, subTasks: true },
      orderBy: { position: "asc" },
    });
  },

  async findById(id: string) {
    return prisma.task.findUnique({
      where: { id },
      include: {
        assignees: { include: { user: true } },
        labels: { include: { label: true } },
        subTasks: true,
        comments: { include: { user: true }, orderBy: { createdAt: "asc" } },
      },
    });
  },

  async create(data: { title: string; description?: string; priority: string; columnId: string; position: number; dueDate?: Date }) {
    return prisma.task.create({ data });
  },

  async getMaxPosition(columnId: string) {
    const result = await prisma.task.aggregate({
      where: { columnId },
      _max: { position: true },
    });
    return (result._max.position ?? -1) + 1;
  },

  async update(id: string, data: any) {
    return prisma.task.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.task.delete({ where: { id } });
  },

  async reorder(items: { id: string; columnId: string; position: number }[]) {
    const ops = items.map(({ id, columnId, position }) =>
      prisma.task.update({ where: { id }, data: { columnId, position } }),
    );
    await prisma.$transaction(ops);
  },
};
