// @vitest-environment node
import { describe, test, expect, vi, beforeEach } from "vitest";
import { SignJWT } from "jose";

vi.mock("server-only", () => ({}));

const mockGet = vi.fn();
vi.mock("next/headers", () => ({
  cookies: vi.fn(() => Promise.resolve({ get: mockGet })),
}));

import { getSession } from "@/lib/auth";

const JWT_SECRET = Buffer.from("development-secret-key");

async function signToken(payload: object, expiresAt: number) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expiresAt)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

describe("getSession", () => {
  beforeEach(() => {
    mockGet.mockReset();
  });

  test("returns null when no cookie is present", async () => {
    mockGet.mockReturnValue(undefined);
    expect(await getSession()).toBeNull();
  });

  test("returns session payload for a valid token", async () => {
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const token = await signToken(
      { userId: "user_123", email: "test@example.com", expiresAt },
      Math.floor(expiresAt.getTime() / 1000)
    );
    mockGet.mockReturnValue({ value: token });

    const session = await getSession();
    expect(session?.userId).toBe("user_123");
    expect(session?.email).toBe("test@example.com");
  });

  test("returns null for an expired token", async () => {
    const expiresAt = Math.floor(Date.now() / 1000) - 3600;
    const token = await signToken({ userId: "user_123", email: "test@example.com" }, expiresAt);
    mockGet.mockReturnValue({ value: token });

    expect(await getSession()).toBeNull();
  });

  test("returns null for a malformed token", async () => {
    mockGet.mockReturnValue({ value: "not.a.valid.token" });
    expect(await getSession()).toBeNull();
  });

  test("returns null for a token signed with a different secret", async () => {
    const wrongSecret = Buffer.from("wrong-secret");
    const token = await new SignJWT({ userId: "user_123", email: "test@example.com" })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .setIssuedAt()
      .sign(wrongSecret);
    mockGet.mockReturnValue({ value: token });

    expect(await getSession()).toBeNull();
  });
});
