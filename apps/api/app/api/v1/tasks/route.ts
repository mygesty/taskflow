import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { taskService } from "@/services/task";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const boardId = searchParams.get("boardId");
    const columnId = searchParams.get("columnId");

    // Use repo directly for filtering — simplified
    const { taskRepository } = await import("@/repositories/task");
    let tasks;
    if (columnId) {
      tasks = await taskRepository.findByColumn(columnId);
    } else if (boardId) {
      tasks = await taskRepository.findByBoard(boardId);
    } else {
      return handleError(new Error("Provide boardId or columnId query parameter"));
    }
    return ok(tasks);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const task = await taskService.createTask(userId, body);
    return created(task);
  } catch (err) {
    return handleError(err);
  }
}
