import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { taskService } from "@/services/task";
import { subTaskRepository } from "@/repositories/subtask";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    await requireAuth();
    const { taskId } = await params;
    const subTasks = await subTaskRepository.findByTask(taskId);
    return ok(subTasks);
  } catch (err) { return handleError(err); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const body = await request.json();
    const subTask = await taskService.addSubTask(taskId, userId, body);
    return created(subTask);
  } catch (err) { return handleError(err); }
}
