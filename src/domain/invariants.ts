import type { PlanPayload } from "./contracts";

export class DomainError extends Error {
  constructor(public code: "AUTH" | "VALIDATION" | "NOT_FOUND" | "CONFLICT" | "DATABASE", message: string, public details?: unknown) {
    super(message);
  }
}

export type PlanState = { status: "draft" | "locked" | "completed" | "superseded"; version: number; baselineVersion: number | null; payload: PlanPayload };

export function reviseDraft(state: PlanState, expectedVersion: number, payload: PlanPayload): PlanState {
  if (state.status !== "draft") throw new DomainError("CONFLICT", "Only a draft plan can be revised");
  if (state.version !== expectedVersion) throw new DomainError("CONFLICT", "Plan version is stale");
  return { ...state, version: state.version + 1, payload };
}

export function lockDraft(state: PlanState, expectedVersion: number): PlanState {
  if (state.status !== "draft") throw new DomainError("CONFLICT", "Plan is already locked or closed");
  if (state.version !== expectedVersion) throw new DomainError("CONFLICT", "Plan version is stale");
  return { ...state, status: "locked", baselineVersion: state.version };
}

export function adaptLocked(state: PlanState, expectedVersion: number, payload: PlanPayload): PlanState {
  if (state.status !== "locked" || state.baselineVersion === null) throw new DomainError("CONFLICT", "Only a locked plan can be adapted");
  if (state.version !== expectedVersion) throw new DomainError("CONFLICT", "Plan version is stale");
  return { ...state, version: state.version + 1, payload };
}

export function assertWorkoutMutable(status: string, version: number, expectedVersion: number) {
  if (["completed", "partial", "skipped", "missed"].includes(status)) throw new DomainError("CONFLICT", "Workout is already closed");
  if (version !== expectedVersion) throw new DomainError("CONFLICT", "Workout version is stale");
}

export function matchesExerciseName(exercise: { canonicalName: string; aliases: string[] }, query: string) {
  const needle = query.trim().toLocaleLowerCase();
  return exercise.canonicalName.toLocaleLowerCase() === needle || exercise.aliases.some(alias => alias.toLocaleLowerCase() === needle);
}
