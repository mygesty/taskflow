import { cookies } from "next/headers";

const ACCESS_TOKEN = "access_token";
const REFRESH_TOKEN = "refresh_token";

const defaults = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "strict" as const,
  path: "/",
};

export async function setAuthCookies(accessToken: string, refreshToken: string) {
  const jar = await cookies();
  jar.set(ACCESS_TOKEN, accessToken, { ...defaults, maxAge: 15 * 60 });
  jar.set(REFRESH_TOKEN, refreshToken, { ...defaults, maxAge: 7 * 24 * 60 * 60 });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.set(ACCESS_TOKEN, "", { ...defaults, maxAge: 0 });
  jar.set(REFRESH_TOKEN, "", { ...defaults, maxAge: 0 });
}

export async function getRefreshTokenCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(REFRESH_TOKEN)?.value;
}

export async function getAccessTokenCookie(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(ACCESS_TOKEN)?.value;
}
