import { NextRequest } from "next/server";
import { requireAuth, handleError, ok, created } from "@/utils/route";
import { labelRepository } from "@/repositories/label";

export async function GET(request: NextRequest) {
  try {
    await requireAuth();
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get("workspaceId");
    if (!workspaceId) return handleError(new Error("workspaceId required"));
    const labels = await labelRepository.findByWorkspace(workspaceId);
    return ok(labels);
  } catch (err) { return handleError(err); }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = await request.json();
    const label = await labelRepository.create(body);
    return created(label);
  } catch (err) { return handleError(err); }
}
