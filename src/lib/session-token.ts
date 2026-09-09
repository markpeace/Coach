import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

function sign(payload: string, secret: string) {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createSignedSessionToken(secret: string, now = Date.now(), ttlSeconds = SESSION_TTL_SECONDS) {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + ttlSeconds, v: 1 })).toString("base64url");
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySignedSessionToken(token: string | undefined, secret: string, now = Date.now()) {
  if (!token) return false;
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return false;
  const expected = sign(payload, secret);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString()) as { exp?: unknown; v?: unknown };
    return decoded.v === 1 && typeof decoded.exp === "number" && decoded.exp > Math.floor(now / 1000);
  } catch {
    return false;
  }
}
