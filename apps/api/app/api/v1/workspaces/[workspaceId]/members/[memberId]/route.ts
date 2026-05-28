import { NextRequest } from "next/server";
import { requireAuth, handleError, ok } from "@/utils/route";
import { workspaceService } from "@/services/workspace";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> },
) {
  try {
    const userId = await requireAuth();
    const { workspaceId, memberId } = await params;
    const body = await request.json();
    const member = await workspaceService.updateMemberRole(workspaceId, userId, memberId, body);
    return ok(member);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string; memberId: string }> },
) {
  try {
    const userId = await requireAuth();
    const { workspaceId, memberId } = await params;
    await workspaceService.removeMember(workspaceId, userId, memberId);
    return ok({ message: "Member removed" });
  } catch (err) {
    return handleError(err);
  }
}
