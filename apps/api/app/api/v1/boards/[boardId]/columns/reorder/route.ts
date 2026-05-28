import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { boardService } from "@/services/board";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const userId = await requireAuth();
    const { boardId } = await params;
    const body = await request.json();
    await boardService.reorderColumns(boardId, userId, body);
    return ok({ message: "Columns reordered" });
  } catch (err) {
    return handleError(err);
  }
}
