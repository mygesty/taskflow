import { paginationSchema } from "@/validators/notification";
import { notificationRepository } from "@/repositories/notification";
import { notFoundError } from "@/utils/errors";

export const notificationService = {
  async listNotifications(userId: string, query: { page?: number; pageSize?: number }) {
    const data = paginationSchema.parse(query);
    return notificationRepository.findByUser(userId, data.page, data.pageSize);
  },

  async getUnreadCount(userId: string) {
    return notificationRepository.countUnread(userId);
  },

  async markRead(notificationId: string, userId: string) {
    const result = await notificationRepository.markAsRead(notificationId, userId);
    if (result.count === 0) throw notFoundError("Notification not found");
  },

  async markAllRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);
  },
};
