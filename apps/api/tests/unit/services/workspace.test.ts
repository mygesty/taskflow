import { describe, it, expect, vi, beforeEach } from "vitest";
import { workspaceService } from "@/services/workspace";
import { workspaceRepository } from "@/repositories/workspace";
import { userRepository } from "@/repositories/user";

vi.mock("@/repositories/workspace", () => ({
  workspaceRepository: {
    findUserWorkspaces: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    findMembers: vi.fn(),
    addMember: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
    findMembership: vi.fn(),
  },
}));

vi.mock("@/repositories/user", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

const mockWs = { id: "ws-1", name: "Test WS", description: null, createdAt: new Date(), members: [] };
const mockMembership = { id: "m-1", workspaceId: "ws-1", userId: "user-1", role: "OWNER", joinedAt: new Date() };

describe("workspaceService", () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe("createWorkspace", () => {
    it("creates workspace and adds creator as OWNER", async () => {
      vi.mocked(workspaceRepository.create).mockResolvedValue(mockWs as any);
      vi.mocked(workspaceRepository.addMember).mockResolvedValue(mockMembership as any);
      vi.mocked(workspaceRepository.findById).mockResolvedValue({ ...mockWs, members: [{ ...mockMembership, user: { id: "user-1", email: "a@b.com", name: "U", avatarUrl: null } }] } as any);

      const result = await workspaceService.createWorkspace("user-1", { name: "Test WS" });
      expect(result).toBeTruthy();
      expect(workspaceRepository.addMember).toHaveBeenCalledWith("ws-1", "user-1", "OWNER");
    });
  });

  describe("getWorkspace", () => {
    it("returns workspace when user is member", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue(mockMembership as any);
      vi.mocked(workspaceRepository.findById).mockResolvedValue(mockWs as any);

      const result = await workspaceService.getWorkspace("ws-1", "user-1");
      expect(result).toBeTruthy();
    });

    it("throws when user is not member", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue(null);
      await expect(workspaceService.getWorkspace("ws-1", "user-2")).rejects.toThrow("not a member");
    });
  });

  describe("deleteWorkspace", () => {
    it("allows Owner to delete", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue(mockMembership as any);
      await expect(workspaceService.deleteWorkspace("ws-1", "user-1")).resolves.toBeUndefined();
    });

    it("rejects non-Owner", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue({ ...mockMembership, role: "MEMBER" } as any);
      await expect(workspaceService.deleteWorkspace("ws-1", "user-1")).rejects.toThrow("Only Owner");
    });
  });

  describe("inviteMember", () => {
    it("allows Admin to invite", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue({ ...mockMembership, role: "ADMIN" } as any);
      vi.mocked(userRepository.findByEmail).mockResolvedValue({ id: "user-2" } as any);
      vi.mocked(workspaceRepository.findMembership)
        .mockResolvedValueOnce({ role: "ADMIN" } as any)
        .mockResolvedValueOnce(null);
      vi.mocked(workspaceRepository.findMembers).mockResolvedValue([]);

      await expect(workspaceService.inviteMember("ws-1", "user-1", { email: "b@c.com" })).resolves.toBeTruthy();
    });

    it("rejects Member inviting", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue({ ...mockMembership, role: "MEMBER" } as any);
      await expect(workspaceService.inviteMember("ws-1", "user-1", { email: "b@c.com" })).rejects.toThrow("Only Owner or Admin");
    });
  });

  describe("leaveWorkspace", () => {
    it("allows Member to leave", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue({ ...mockMembership, role: "MEMBER" } as any);
      await expect(workspaceService.leaveWorkspace("ws-1", "user-1")).resolves.toBeUndefined();
    });

    it("rejects Owner leaving", async () => {
      vi.mocked(workspaceRepository.findMembership).mockResolvedValue(mockMembership as any);
      await expect(workspaceService.leaveWorkspace("ws-1", "user-1")).rejects.toThrow("Owner cannot leave");
    });
  });
});
