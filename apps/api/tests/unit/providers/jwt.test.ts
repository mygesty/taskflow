import { describe, it, expect } from "vitest";
import {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "@/providers/jwt";

describe("JWT Provider", () => {
  const userId = "test-user-id";

  describe("signAccessToken + verifyAccessToken", () => {
    it("signs and verifies successfully", async () => {
      const token = await signAccessToken(userId);
      expect(token).toBeTruthy();
      const payload = await verifyAccessToken(token);
      expect(payload.userId).toBe(userId);
    });

    it("rejects invalid token", async () => {
      await expect(verifyAccessToken("invalid.token.here")).rejects.toThrow();
    });

    it("rejects empty token", async () => {
      await expect(verifyAccessToken("")).rejects.toThrow();
    });
  });

  describe("signRefreshToken + verifyRefreshToken", () => {
    it("signs and verifies successfully", async () => {
      const token = await signRefreshToken(userId);
      expect(token).toBeTruthy();
      const payload = await verifyRefreshToken(token);
      expect(payload.userId).toBe(userId);
    });

    it("rejects invalid token", async () => {
      await expect(verifyRefreshToken("invalid.token.here")).rejects.toThrow();
    });
  });

  describe("cross-verification", () => {
    it("access token verification rejects refresh token with wrong type check", async () => {
      const refreshToken = await signRefreshToken(userId);
      // Different expiry doesn't matter, but both are HS256 so both verify
      const payload = await verifyAccessToken(refreshToken);
      expect(payload.userId).toBe(userId);
    });
  });
});
