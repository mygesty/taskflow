import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { notificationService } from "@/services/notification";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const page = Number(searchParams.get("page")) || 1;
    const pageSize = Number(searchParams.get("pageSize")) || 20;
    const result = await notificationService.listNotifications(userId, { page, pageSize });
    return ok(result);
  } catch (err) { return handleError(err); }
}
