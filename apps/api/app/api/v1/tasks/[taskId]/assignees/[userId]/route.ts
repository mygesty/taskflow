import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ taskId: string; userId: string }> }) {
  try {
    const operatorId = await requireAuth();
    const { taskId, userId } = await params;
    await taskService.removeAssignee(taskId, operatorId, userId);
    return ok({ message: "Assignee removed" });
  } catch (err) { return handleError(err); }
}
