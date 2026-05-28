import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { boardService } from "@/services/board";
import { columnRepository } from "@/repositories/column";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const userId = await requireAuth();
    const { boardId } = await params;
    // verify access via boardService.getBoard
    await boardService.getBoard(boardId, userId);
    const columns = await columnRepository.findByBoard(boardId);
    return ok(columns);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ boardId: string }> }) {
  try {
    const userId = await requireAuth();
    const { boardId } = await params;
    const body = await request.json();
    const column = await boardService.addColumn(boardId, userId, body);
    return created(column);
  } catch (err) {
    return handleError(err);
  }
}
