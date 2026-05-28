import { requireAuth, handleError, ok } from "@/utils/route";
import { notificationService } from "@/services/notification";

export async function POST() {
  try {
    const userId = await requireAuth();
    await notificationService.markAllRead(userId);
    return ok({ message: "All marked as read" });
  } catch (err) { return handleError(err); }
}
