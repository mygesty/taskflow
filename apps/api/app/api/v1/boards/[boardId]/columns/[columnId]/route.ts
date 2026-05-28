import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { boardService } from "@/services/board";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ columnId: string }> }) {
  try {
    const userId = await requireAuth();
    const { columnId } = await params;
    const body = await request.json();
    const column = await boardService.updateColumn(columnId, userId, body);
    return ok(column);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ columnId: string }> }) {
  try {
    const userId = await requireAuth();
    const { columnId } = await params;
    await boardService.deleteColumn(columnId, userId);
    return ok({ message: "Column deleted" });
  } catch (err) {
    return handleError(err);
  }
}
