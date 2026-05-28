import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const task = await taskService.getTask(taskId, userId);
    return ok(task);
  } catch (err) { return handleError(err); }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const body = await request.json();
    const task = await taskService.updateTask(taskId, userId, body);
    return ok(task);
  } catch (err) { return handleError(err); }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    await taskService.deleteTask(taskId, userId);
    return ok({ message: "Task deleted" });
  } catch (err) { return handleError(err); }
}
