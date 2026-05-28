import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { authService } from "@/services/auth";
import { userRepository } from "@/repositories/user";
import * as jwt from "@/providers/jwt";
import bcrypt from "bcryptjs";

vi.mock("@/repositories/user", () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock("@/providers/jwt", () => ({
  signAccessToken: vi.fn(),
  signRefreshToken: vi.fn(),
  verifyRefreshToken: vi.fn(),
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
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

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    const input = {
      email: "new@example.com",
      password: "Abcdef1g",
      name: "New User",
    };

    it("creates user and returns tokens on success", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);
      vi.mocked(userRepository.create).mockResolvedValue({ ...mockUser, email: input.email, name: input.name });
      vi.mocked(bcrypt.hash).mockResolvedValue("hashed" as never);
      vi.mocked(jwt.signAccessToken).mockResolvedValue("access-token");
      vi.mocked(jwt.signRefreshToken).mockResolvedValue("refresh-token");

      const result = await authService.register(input);

      expect(result.user.email).toBe(input.email);
      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
      expect(userRepository.create).toHaveBeenCalledWith({
        email: input.email,
        name: input.name,
        passwordHash: "hashed",
      });
    });

    it("throws CONFLICT when email already exists", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);

      await expect(authService.register(input)).rejects.toThrow("Email already registered");
    });
  });

  describe("login", () => {
    const input = { email: "test@example.com", password: "Abcdef1g" };

    it("returns tokens on valid credentials", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);
      vi.mocked(jwt.signAccessToken).mockResolvedValue("access-token");
      vi.mocked(jwt.signRefreshToken).mockResolvedValue("refresh-token");

      const result = await authService.login(input);

      expect(result.accessToken).toBe("access-token");
      expect(result.refreshToken).toBe("refresh-token");
    });

    it("throws UNAUTHORIZED when user not found", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(null);

      await expect(authService.login(input)).rejects.toThrow("Invalid email or password");
    });

    it("throws UNAUTHORIZED when password is wrong", async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(authService.login(input)).rejects.toThrow("Invalid email or password");
    });
  });

  describe("refreshToken", () => {
    it("returns new tokens when refresh token is valid", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockResolvedValue({ userId: "user-1" });
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
      vi.mocked(jwt.signAccessToken).mockResolvedValue("new-access");
      vi.mocked(jwt.signRefreshToken).mockResolvedValue("new-refresh");

      const result = await authService.refreshToken("valid-token");

      expect(result.accessToken).toBe("new-access");
      expect(result.refreshToken).toBe("new-refresh");
    });

    it("throws UNAUTHORIZED when token is invalid", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockRejectedValue(new Error("expired"));

      await expect(authService.refreshToken("bad-token")).rejects.toThrow("Invalid or expired refresh token");
    });

    it("throws UNAUTHORIZED when user not found", async () => {
      vi.mocked(jwt.verifyRefreshToken).mockResolvedValue({ userId: "missing" });
      vi.mocked(userRepository.findById).mockResolvedValue(null);

      await expect(authService.refreshToken("valid-token")).rejects.toThrow("User not found");
    });
  });

  describe("logout", () => {
    it("completes without error", async () => {
      await expect(authService.logout("user-1")).resolves.toBeUndefined();
    });
  });
});
