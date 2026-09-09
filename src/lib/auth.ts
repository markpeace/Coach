import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/env";

const COOKIE = "coach_household";
const ONE_WEEK = 60 * 60 * 24 * 7;

function sign(value: string) { return createHmac("sha256", env().SESSION_SECRET).update(value).digest("base64url"); }

export function createSessionToken(now = Date.now()) {
  const payload = Buffer.from(JSON.stringify({ exp: Math.floor(now / 1000) + ONE_WEEK, v: 1 })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token?: string) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = sign(payload);
  if (signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return false;
  try { return JSON.parse(Buffer.from(payload, "base64url").toString()).exp > Math.floor(Date.now() / 1000); } catch { return false; }
}

export async function hasHouseholdSession() { return verifySessionToken((await cookies()).get(COOKIE)?.value); }
export async function setHouseholdSession() { (await cookies()).set(COOKIE, createSessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: ONE_WEEK }); }
export async function clearHouseholdSession() { (await cookies()).delete(COOKIE); }

export function isValidPassphrase(value: string) {
  const expected = env().HOUSEHOLD_PASSPHRASE;
  return value.length === expected.length && timingSafeEqual(Buffer.from(value), Buffer.from(expected));
}

export function isValidActionKey(header: string | null) {
  const supplied = header?.replace(/^Bearer\s+/i, "") ?? "";
  const expected = env().GPT_ACTION_API_KEY;
  return supplied.length === expected.length && timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
}

export const sessionCookieName = COOKIE;
