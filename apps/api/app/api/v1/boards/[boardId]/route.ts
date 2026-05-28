import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { boardService } from "@/services/board";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const userId = await requireAuth();
    const { boardId } = await params;
    const board = await boardService.getBoard(boardId, userId);
    return ok(board);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const userId = await requireAuth();
    const { boardId } = await params;
    const body = await request.json();
    const board = await boardService.updateBoard(boardId, userId, body);
    return ok(board);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const userId = await requireAuth();
    const { boardId } = await params;
    await boardService.deleteBoard(boardId, userId);
    return ok({ message: "Board deleted" });
  } catch (err) {
    return handleError(err);
  }
}
