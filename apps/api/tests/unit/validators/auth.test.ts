import { describe, it, expect } from "vitest";
import { registerSchema, loginSchema, refreshTokenSchema } from "@/validators/auth";

describe("registerSchema", () => {
  const validInput = {
    email: "test@example.com",
    password: "Abcdef1g",
    name: "Test User",
  };

  it("accepts valid input", () => {
    const result = registerSchema.safeParse(validInput);
    expect(result.success).toBe(true);
  });

  it("rejects missing email", () => {
    const result = registerSchema.safeParse({ password: "Abcdef1g", name: "T" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", name: "T" });
    expect(result.success).toBe(false);
  });

  it("rejects missing name", () => {
    const result = registerSchema.safeParse({ email: "a@b.com", password: "Abcdef1g" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid email format", () => {
    const result = registerSchema.safeParse({ ...validInput, email: "notanemail" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 8 chars", () => {
    const result = registerSchema.safeParse({ ...validInput, password: "Ab1def" });
    expect(result.success).toBe(false);
  });

  it("rejects password without uppercase", () => {
    const result = registerSchema.safeParse({ ...validInput, password: "abcdef1g" });
    expect(result.success).toBe(false);
  });

  it("rejects password without lowercase", () => {
    const result = registerSchema.safeParse({ ...validInput, password: "ABCDEF1G" });
    expect(result.success).toBe(false);
  });

  it("rejects password without digit", () => {
    const result = registerSchema.safeParse({ ...validInput, password: "Abcdefgh" });
    expect(result.success).toBe(false);
  });

  it("rejects empty name", () => {
    const result = registerSchema.safeParse({ ...validInput, name: "" });
    expect(result.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const result = registerSchema.safeParse({ ...validInput, name: "A".repeat(101) });
    expect(result.success).toBe(false);
  });

  it("accepts name at 100 chars boundary", () => {
    const result = registerSchema.safeParse({ ...validInput, name: "A".repeat(100) });
    expect(result.success).toBe(true);
  });
});

describe("loginSchema", () => {
  it("accepts valid input", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "pw" });
    expect(result.success).toBe(true);
  });

  it("rejects invalid email", () => {
    const result = loginSchema.safeParse({ email: "bad", password: "pw" });
    expect(result.success).toBe(false);
  });

  it("rejects empty password", () => {
    const result = loginSchema.safeParse({ email: "a@b.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("refreshTokenSchema", () => {
  it("accepts valid token", () => {
    const result = refreshTokenSchema.safeParse({ token: "some-jwt-token" });
    expect(result.success).toBe(true);
  });

  it("rejects empty token", () => {
    const result = refreshTokenSchema.safeParse({ token: "" });
    expect(result.success).toBe(false);
  });
});
