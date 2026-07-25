import { SignJWT, jwtVerify } from "jose";
import { hash as bhash, compare } from "bcryptjs";

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || "dev-secret-min-32-chars-long-xxxx"
);

export async function hashPassword(p: string) {
  return bhash(p, 10);
}

export async function verifyPassword(p: string, h: string) {
  return compare(p, h);
}

export async function signToken(payload: {
  id: string;
  username: string;
  role: string;
}) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("12h")
    .setIssuedAt()
    .sign(secret);
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, secret);
  return payload as { id: string; username: string; role: string };
}

export function getCookie(cookStr: string, name: string) {
  const m = cookStr.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]!) : null;
}
