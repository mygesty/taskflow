import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { workspaceService } from "@/services/workspace";

export async function GET() {
  try {
    const userId = await requireAuth();
    const workspaces = await workspaceService.listWorkspaces(userId);
    return ok(workspaces);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await requireAuth();
    const body = await request.json();
    const workspace = await workspaceService.createWorkspace(userId, body);
    return created(workspace);
  } catch (err) {
    return handleError(err);
  }
}
