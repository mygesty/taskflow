import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const body = await request.json();
    await taskService.moveTask(taskId, userId, body);
    return ok({ message: "Task moved" });
  } catch (err) {
    return handleError(err);
  }
}
