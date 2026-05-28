import { prisma } from "@/providers/prisma";

export const columnRepository = {
  async findByBoard(boardId: string) {
    return prisma.boardColumn.findMany({
      where: { boardId },
      include: {
        tasks: {
          orderBy: { position: "asc" },
          include: {
            assignees: { include: { user: true } },
            labels: { include: { label: true } },
            subTasks: true,
          },
        },
      },
      orderBy: { position: "asc" },
    });
  },

  async create(data: { boardId: string; title: string; position: number }) {
    return prisma.boardColumn.create({ data });
  },

  async getMaxPosition(boardId: string) {
    const result = await prisma.boardColumn.aggregate({
      where: { boardId },
      _max: { position: true },
    });
    return (result._max.position ?? -1) + 1;
  },

  async update(id: string, data: { title?: string }) {
    return prisma.boardColumn.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.boardColumn.delete({ where: { id } });
  },

  async reorder(items: { id: string; position: number }[]) {
    const ops = items.map(({ id, position }) =>
      prisma.boardColumn.update({ where: { id }, data: { position } }),
    );
    await prisma.$transaction(ops);
  },

  async findById(id: string) {
    return prisma.boardColumn.findUnique({ where: { id } });
  },

  async countByBoard(boardId: string) {
    return prisma.boardColumn.count({ where: { boardId } });
  },
};
