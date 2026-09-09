import { describe, expect, it } from "vitest";
import { operationSchema, planPayloadSchema, goalSchema, locationSchema } from "@/domain/contracts";
import { adaptLocked, assertWorkoutMutable, DomainError, lockDraft, matchesExerciseName, reviseDraft, type PlanState } from "@/domain/invariants";
import { createSignedSessionToken, verifySignedSessionToken } from "@/lib/session-token";

const strengthPlan = planPayloadSchema.parse({ rationale: "A coherent fictional week", sessions: [{ key: "strength-mon", date: "2026-09-14", title: "Upper strength", intendedStimulus: "Upper-body strength", durationMinutes: 45, modality: "strength", prescription: { exercises: [{ exerciseName: "Dumbbell bench press", sets: [{ reps: 10, load: 14, unit: "kg", restSeconds: 90 }] }] } }] });

describe("domain contracts", () => {
  it("supports numeric and qualitative goals without requiring fake values", () => {
    expect(goalSchema.parse({ title: "5K", description: "Run under 30 minutes", type: "performance", targetValue: 30, targetUnit: "minutes" }).targetValue).toBe(30);
    expect(goalSchema.parse({ title: "Upper body", description: "Build chest and shoulders", type: "physique", qualitativeTarget: "Visible development", indicators: ["training consistency"] }).targetValue).toBeUndefined();
  });
  it("supports structured location constraints", () => {
    const location = locationSchema.parse({ name: "Home", kind: "home", equipment: [{ name: "Dumbbells", type: "free_weight", attributes: { maxKg: 20, incrementKg: 2 } }] });
    expect(location.equipment[0].attributes.maxKg).toBe(20);
  });
  it("requires explicit athlete scope on athlete operations", () => {
    expect(() => operationSchema.parse({ operation: "getProgress", periodStart: "2026-09-01", periodEnd: "2026-09-07" })).toThrow();
  });
  it("accepts partial evidence while rejecting invented invalid values", () => {
    const op = operationSchema.parse({ operation: "completeWorkout", athleteId: crypto.randomUUID(), workoutId: crypto.randomUUID(), expectedVersion: 1, outcome: "completed", actual: { distanceKm: 5, source: { kind: "athlete_evidence", label: "Screenshot", confidence: "medium" } }, evidence: [{ source: { kind: "athlete_evidence", label: "Screenshot" }, description: "Visible distance only", fields: ["distanceKm"], retainedRaw: false }], idempotencyKey: "evidence-12345" });
    expect(op.operation).toBe("completeWorkout");
    expect(() => operationSchema.parse({ ...op, actual: { averageHeartRate: 999, source: { kind: "manual", label: "bad" } } })).toThrow();
  });
  it("matches stable exercise identity through canonical names and aliases", () => {
    const bench = { canonicalName: "Dumbbell bench press", aliases: ["DB bench", "Dumbbell press"] };
    expect(matchesExerciseName(bench, "db bench")).toBe(true);
    expect(matchesExerciseName(bench, "barbell bench press")).toBe(false);
  });
});

describe("signed household sessions", () => {
  const secret = "a-test-secret-long-enough-for-hmac";
  const now = Date.UTC(2026, 8, 9, 12);
  it("accepts a valid session and rejects tampering", () => {
    const token = createSignedSessionToken(secret, now);
    expect(verifySignedSessionToken(token, secret, now + 1_000)).toBe(true);
    expect(verifySignedSessionToken(`${token.slice(0, -1)}x`, secret, now + 1_000)).toBe(false);
  });
  it("rejects an expired session", () => {
    const token = createSignedSessionToken(secret, now, 60);
    expect(verifySignedSessionToken(token, secret, now + 61_000)).toBe(false);
  });
});

describe("plan and workout invariants", () => {
  const draft: PlanState = { status: "draft", version: 1, baselineVersion: null, payload: strengthPlan };
  it("revises only the current draft", () => { expect(reviseDraft(draft, 1, { ...strengthPlan, rationale: "Revised" }).version).toBe(2); expect(() => reviseDraft(draft, 2, strengthPlan)).toThrow(DomainError); });
  it("locks an explicit immutable baseline reference", () => { expect(lockDraft(draft, 1)).toMatchObject({ status: "locked", baselineVersion: 1, version: 1 }); });
  it("adapts effective state without moving the baseline", () => { const locked = lockDraft(draft, 1); const adapted = adaptLocked(locked, 1, { ...strengthPlan, rationale: "Travel adaptation" }); expect(adapted).toMatchObject({ version: 2, baselineVersion: 1 }); expect(locked.payload.rationale).toBe("A coherent fictional week"); });
  it("rejects stale and post-completion workout mutations", () => { expect(() => assertWorkoutMutable("in_progress", 2, 1)).toThrow(/stale/); expect(() => assertWorkoutMutable("completed", 2, 2)).toThrow(/closed/); });
});
