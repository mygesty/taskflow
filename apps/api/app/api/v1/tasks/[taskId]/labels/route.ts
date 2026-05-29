import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { taskService } from "@/services/task";
import { labelRepository } from "@/repositories/label";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    await requireAuth();
    const { taskId } = await params;
    const labels = await labelRepository.findByTask(taskId);
    return ok(labels);
  } catch (err) { return handleError(err); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const body = await request.json();
    const labels = await taskService.addLabel(taskId, userId, body);
    return ok(labels);
  } catch (err) { return handleError(err); }
}
