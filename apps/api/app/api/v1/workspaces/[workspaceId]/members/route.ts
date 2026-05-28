import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { workspaceService } from "@/services/workspace";
import { workspaceRepository } from "@/repositories/workspace";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const userId = await requireAuth();
    const { workspaceId } = await params;
    await workspaceService.getWorkspace(workspaceId, userId);
    const members = await workspaceRepository.findMembers(workspaceId);
    return ok(members);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ workspaceId: string }> }) {
  try {
    const userId = await requireAuth();
    const { workspaceId } = await params;
    const body = await request.json();
    const members = await workspaceService.inviteMember(workspaceId, userId, body);
    return ok(members);
  } catch (err) {
    return handleError(err);
  }
}
