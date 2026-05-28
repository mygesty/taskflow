import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const body = await request.json();
    const assignees = await taskService.assignMember(taskId, userId, body);
    return ok(assignees);
  } catch (err) { return handleError(err); }
}
