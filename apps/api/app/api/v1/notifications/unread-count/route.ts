import { requireAuth, handleError, ok } from "@/utils/route";
import { notificationService } from "@/services/notification";

export async function GET() {
  try {
    const userId = await requireAuth();
    const count = await notificationService.getUnreadCount(userId);
    return ok({ count });
  } catch (err) { return handleError(err); }
}
