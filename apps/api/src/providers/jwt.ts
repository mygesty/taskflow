import { SignJWT, jwtVerify } from "jose";

function getSecret() {
  const secret = process.env.JWT_SECRET || "dev-secret-key-minimum-32-characters-long";
  return new TextEncoder().encode(secret);
}

export async function signAccessToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getSecret());
}

export async function signRefreshToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecret());
}

export async function verifyAccessToken(
  token: string,
): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
    clockTolerance: "30s",
  });
  return { userId: payload.sub! };
}

export async function verifyRefreshToken(
  token: string,
): Promise<{ userId: string }> {
  const { payload } = await jwtVerify(token, getSecret(), {
    algorithms: ["HS256"],
  });
  return { userId: payload.sub! };
}
