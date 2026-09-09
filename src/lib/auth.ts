import "server-only";
import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { env } from "@/env";
import { createSignedSessionToken, SESSION_TTL_SECONDS, verifySignedSessionToken } from "./session-token";

const COOKIE = "coach_household";
export function createSessionToken(now = Date.now()) {
  return createSignedSessionToken(env().SESSION_SECRET, now);
}

export function verifySessionToken(token?: string) {
  return verifySignedSessionToken(token, env().SESSION_SECRET);
}

export async function hasHouseholdSession() { return verifySessionToken((await cookies()).get(COOKIE)?.value); }
export async function setHouseholdSession() { (await cookies()).set(COOKIE, createSessionToken(), { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: SESSION_TTL_SECONDS }); }
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
