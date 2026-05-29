import { describe, it, expect, beforeEach } from "vitest";
import { authService } from "@/services/auth";
import { prisma } from "@/providers/prisma";

describe("Auth Service Integration", () => {
  const validUser = {
    email: "integration@example.com",
    password: "Abcdef1g",
    name: "Integration Test",
  };

  beforeEach(async () => {
    await prisma.user.deleteMany({ where: { email: validUser.email } });
  });

  describe("register", () => {
    it("creates user and returns tokens", async () => {
      const result = await authService.register(validUser);

      expect(result.user.email).toBe(validUser.email);
      expect(result.user.name).toBe(validUser.name);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();

      const dbUser = await prisma.user.findUnique({ where: { email: validUser.email } });
      expect(dbUser).toBeTruthy();
      expect(dbUser!.passwordHash).not.toBe(validUser.password);
    });

    it("throws CONFLICT on duplicate email", async () => {
      await authService.register(validUser);
      await expect(authService.register(validUser)).rejects.toThrow("Email already registered");
    });

    it("throws VALIDATION_ERROR on invalid input", async () => {
      await expect(
        authService.register({ email: "bad", password: "short" } as any),
      ).rejects.toThrow();
    });
  });

  describe("login", () => {
    beforeEach(async () => {
      await authService.register(validUser);
    });

    it("returns tokens on valid credentials", async () => {
      const result = await authService.login({
        email: validUser.email,
        password: validUser.password,
      });

      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
      expect(result.user.email).toBe(validUser.email);
    });

    it("throws UNAUTHORIZED for wrong password", async () => {
      await expect(
        authService.login({ email: validUser.email, password: "WrongPass1" }),
      ).rejects.toThrow("Invalid email or password");
    });

    it("throws UNAUTHORIZED for nonexistent email", async () => {
      await expect(
        authService.login({ email: "nobody@example.com", password: "Abcdef1g" }),
      ).rejects.toThrow("Invalid email or password");
    });
  });

  describe("refreshToken", () => {
    const refreshEmail = "refresh-test@example.com";

    beforeEach(async () => {
      await prisma.user.deleteMany({ where: { email: refreshEmail } });
    });

    it("returns new tokens with valid refresh token", async () => {
      const { refreshToken } = await authService.register({
        email: refreshEmail,
        password: "Abcdef1g",
        name: "Refresh Test",
      });

      const result = await authService.refreshToken(refreshToken);
      expect(result.accessToken).toBeTruthy();
      expect(result.refreshToken).toBeTruthy();
    });

    it("throws UNAUTHORIZED for invalid token", async () => {
      await expect(
        authService.refreshToken("invalid-token"),
      ).rejects.toThrow("Invalid or expired refresh token");
    });
  });

  describe("logout", () => {
    it("completes without error", async () => {
      await expect(authService.logout("user-1")).resolves.toBeUndefined();
    });
  });
});
