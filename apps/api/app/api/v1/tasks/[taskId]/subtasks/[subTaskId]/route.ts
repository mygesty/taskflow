import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ subTaskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { subTaskId } = await params;
    const body = await request.json();
    const subTask = await taskService.updateSubTask(subTaskId, userId, body);
    return ok(subTask);
  } catch (err) { return handleError(err); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ subTaskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { subTaskId } = await params;
    await taskService.deleteSubTask(subTaskId, userId);
    return ok({ message: "Subtask deleted" });
  } catch (err) { return handleError(err); }
}
