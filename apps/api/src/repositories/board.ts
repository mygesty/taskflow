import { prisma } from "@/providers/prisma";
import { DEFAULT_BOARD_COLUMNS } from "@taskflow/shared/constants";

export const boardRepository = {
  async findByWorkspace(workspaceId: string) {
    return prisma.board.findMany({
      where: { workspaceId },
      include: { columns: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    return prisma.board.findUnique({
      where: { id },
      include: { columns: { orderBy: { position: "asc" } } },
    });
  },

  async create(data: { title: string; description?: string; workspaceId: string }) {
    const board = await prisma.board.create({ data });
    const columns = await Promise.all(
      DEFAULT_BOARD_COLUMNS.map((title, position) =>
        prisma.boardColumn.create({ data: { boardId: board.id, title, position } }),
      ),
    );
    return { ...board, columns };
  },

  async update(id: string, data: { title?: string; description?: string }) {
    return prisma.board.update({ where: { id }, data });
  },

  async delete(id: string) {
    return prisma.board.delete({ where: { id } });
  },
};
