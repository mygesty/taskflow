import { describe, it, expect } from "vitest";
import { createWorkspaceSchema, inviteMemberSchema, updateRoleSchema } from "@/validators/workspace";

describe("createWorkspaceSchema", () => {
  it("accepts valid input", () => {
    const r = createWorkspaceSchema.safeParse({ name: "My Workspace" });
    expect(r.success).toBe(true);
  });

  it("accepts optional description", () => {
    const r = createWorkspaceSchema.safeParse({ name: "W", description: "desc" });
    expect(r.success).toBe(true);
  });

  it("rejects empty name", () => {
    const r = createWorkspaceSchema.safeParse({ name: "" });
    expect(r.success).toBe(false);
  });

  it("rejects name over 100 chars", () => {
    const r = createWorkspaceSchema.safeParse({ name: "A".repeat(101) });
    expect(r.success).toBe(false);
  });
});

describe("inviteMemberSchema", () => {
  it("accepts valid input with role", () => {
    const r = inviteMemberSchema.safeParse({ email: "a@b.com", role: "ADMIN" });
    expect(r.success).toBe(true);
  });

  it("defaults role to MEMBER", () => {
    const r = inviteMemberSchema.safeParse({ email: "a@b.com" });
    expect(r.success).toBe(true);
    if (r.success) expect(r.data.role).toBe("MEMBER");
  });

  it("rejects invalid email", () => {
    const r = inviteMemberSchema.safeParse({ email: "bad" });
    expect(r.success).toBe(false);
  });

  it("rejects invalid role", () => {
    const r = inviteMemberSchema.safeParse({ email: "a@b.com", role: "GUEST" });
    expect(r.success).toBe(false);
  });
});

describe("updateRoleSchema", () => {
  it("accepts ADMIN", () => {
    const r = updateRoleSchema.safeParse({ role: "ADMIN" });
    expect(r.success).toBe(true);
  });

  it("accepts MEMBER", () => {
    const r = updateRoleSchema.safeParse({ role: "MEMBER" });
    expect(r.success).toBe(true);
  });

  it("rejects OWNER", () => {
    const r = updateRoleSchema.safeParse({ role: "OWNER" });
    expect(r.success).toBe(false);
  });
});
