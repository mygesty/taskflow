import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { workspaceService } from "@/services/workspace";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const userId = await requireAuth();
    const { workspaceId } = await params;
    const workspace = await workspaceService.getWorkspace(workspaceId, userId);
    return ok(workspace);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const userId = await requireAuth();
    const { workspaceId } = await params;
    const body = await request.json();
    const workspace = await workspaceService.updateWorkspace(workspaceId, userId, body);
    return ok(workspace);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const userId = await requireAuth();
    const { workspaceId } = await params;
    await workspaceService.deleteWorkspace(workspaceId, userId);
    return ok({ message: "Workspace deleted" });
  } catch (err) {
    return handleError(err);
  }
}
