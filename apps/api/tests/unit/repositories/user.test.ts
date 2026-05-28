import { describe, it, expect, vi, beforeEach } from "vitest";
import { userRepository } from "@/repositories/user";
import { prisma } from "@/providers/prisma";

vi.mock("@/providers/prisma", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

const mockUser = {
  id: "user-1",
  email: "test@example.com",
  name: "Test",
  passwordHash: "hashed",
  avatarUrl: null,
  createdAt: new Date(),
};

describe("userRepository", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("findByEmail", () => {
    it("returns user when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const user = await userRepository.findByEmail("test@example.com");
      expect(user).toEqual(mockUser);
      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: "test@example.com" },
      });
    });

    it("returns null when not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const user = await userRepository.findByEmail("nobody@example.com");
      expect(user).toBeNull();
    });
  });

  describe("findById", () => {
    it("returns user when found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);
      const user = await userRepository.findById("user-1");
      expect(user).toEqual(mockUser);
    });

    it("returns null when not found", async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      const user = await userRepository.findById("missing-id");
      expect(user).toBeNull();
    });
  });

  describe("create", () => {
    it("creates and returns user", async () => {
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);
      const user = await userRepository.create({
        email: "test@example.com",
        name: "Test",
        passwordHash: "hashed",
      });
      expect(user).toEqual(mockUser);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          name: "Test",
          passwordHash: "hashed",
        },
      });
    });
  });
});
