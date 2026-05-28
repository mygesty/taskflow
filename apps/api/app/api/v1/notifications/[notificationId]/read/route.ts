import { requireAuth, handleError, ok } from "@/utils/route";
import { notificationService } from "@/services/notification";

export async function PATCH(_req: Request, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const userId = await requireAuth();
    const { notificationId } = await params;
    await notificationService.markRead(notificationId, userId);
    return ok({ message: "Marked as read" });
  } catch (err) { return handleError(err); }
}
