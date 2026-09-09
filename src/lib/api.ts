import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { DomainError } from "@/domain/invariants";

const status = { AUTH: 401, VALIDATION: 400, NOT_FOUND: 404, CONFLICT: 409, DATABASE: 500 } as const;

export function apiSuccess(data: unknown, statusCode = 200) { return NextResponse.json({ ok: true, data }, { status: statusCode }); }
export function apiFailure(error: unknown) {
  if (error instanceof ZodError) return NextResponse.json({ ok: false, error: { code: "VALIDATION", message: "Request validation failed", details: error.issues } }, { status: 400 });
  if (error instanceof DomainError) return NextResponse.json({ ok: false, error: { code: error.code, message: error.message, details: error.details } }, { status: status[error.code] });
  console.error("Coach API failure", error instanceof Error ? error.message : "Unknown database/runtime failure");
  return NextResponse.json({ ok: false, error: { code: "DATABASE", message: "The operation could not be completed" } }, { status: 500 });
}
