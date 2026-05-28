import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { commentService } from "@/services/comment";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const comments = await commentService.listComments(taskId, userId);
    return ok(comments);
  } catch (err) { return handleError(err); }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ taskId: string }> }) {
  try {
    const userId = await requireAuth();
    const { taskId } = await params;
    const body = await request.json();
    const comment = await commentService.createComment(taskId, userId, body);
    return created(comment);
  } catch (err) { return handleError(err); }
}
