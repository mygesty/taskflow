import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ taskId: string; labelId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId, labelId } = await params;
    await taskService.removeLabel(taskId, labelId, userId);
    return ok({ message: "Label removed" });
  } catch (err) { return handleError(err); }
}
