import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { commentService } from "@/services/comment";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const userId = await requireAuth();
    const { commentId } = await params;
    await commentService.deleteComment(commentId, userId);
    return ok({ message: "Comment deleted" });
  } catch (err) { return handleError(err); }
}
