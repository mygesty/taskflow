import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { boardService } from "@/services/board";

export async function GET(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) {
      return handleError(new Error("workspaceId query parameter is required"));
    }
    const boards = await boardService.listBoards(workspaceId, userId);
    return ok(boards);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const board = await boardService.createBoard(userId, body);
    return created(board);
  } catch (err) {
    return handleError(err);
  }
}
