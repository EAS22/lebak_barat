import { SignJWT, jwtVerify } from "jose";
import { hash as bhash, compare } from "bcryptjs";

function getSecret() {
  const s = process.env.JWT_SECRET || "dev-secret-min-32-chars-long-xxxx";
  return new TextEncoder().encode(s);
}

export async function hashPassword(p: string) {
  return bhash(p, 10);
}
export async function verifyPassword(p: string, h: string) {
  return compare(p, h);
}
export async function signToken(payload: { id: string; username: string; role: string }) {
  return new SignJWT(payload as any)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .setIssuedAt()
    .sign(getSecret());
}
export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as { id: string; username: string; role: string };
}
