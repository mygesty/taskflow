import { prisma } from "@/providers/prisma";

export const notificationRepository = {
  async findByUser(userId: string, page: number, pageSize: number) {
    const [items, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { task: { select: { id: true, title: true } } },
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
    return { items, total, page, pageSize };
  },

  async countUnread(userId: string) {
    return prisma.notification.count({ where: { userId, read: false } });
  },

  async markAsRead(id: string, userId: string) {
    return prisma.notification.updateMany({
      where: { id, userId },
      data: { read: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  },
};
