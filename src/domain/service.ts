import "server-only";
import { createHash } from "node:crypto";
import { and, asc, desc, eq, gte, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { athleteContext, athletes, exercises, idempotency, metricDefinitions, metricReadings, observations, plans, planVersions, reviews, setActuals, weeklyContext, workouts } from "@/db/schema";
import { operationSchema, planPayloadSchema, type CoachOperation, validateContext } from "./contracts";
import { assertWorkoutMutable, DomainError } from "./invariants";

type Json = Record<string, unknown>;
type Result = Json | Json[];

function hash(value: unknown) { return createHash("sha256").update(JSON.stringify(value)).digest("hex"); }

async function ensureAthlete(athleteId: string) {
  const [athlete] = await db().select().from(athletes).where(eq(athletes.id, athleteId)).limit(1);
  if (!athlete) throw new DomainError("NOT_FOUND", "Athlete not found");
  return athlete;
}

async function idempotent(op: CoachOperation & { idempotencyKey: string }, work: () => Promise<Result>): Promise<Result> {
  const requestHash = hash(op);
  const [existing] = await db().select().from(idempotency).where(eq(idempotency.key, op.idempotencyKey)).limit(1);
  if (existing) {
    if (existing.operation !== op.operation || existing.requestHash !== requestHash || existing.athleteId !== ("athleteId" in op ? op.athleteId : null)) {
      throw new DomainError("CONFLICT", "Idempotency key was already used for a different request");
    }
    return existing.response;
  }
  const response = await work();
  try {
    await db().insert(idempotency).values({ key: op.idempotencyKey, operation: op.operation, athleteId: "athleteId" in op ? op.athleteId : null, requestHash, response: response as Json });
  } catch (error) {
    const [race] = await db().select().from(idempotency).where(eq(idempotency.key, op.idempotencyKey)).limit(1);
    if (!race || race.requestHash !== requestHash) throw error;
    return race.response;
  }
  return response;
}

async function contextFor(athleteId: string) {
  const athlete = await ensureAthlete(athleteId);
  const [entries, definitions, readings] = await Promise.all([
    db().select().from(athleteContext).where(and(eq(athleteContext.athleteId, athleteId), eq(athleteContext.active, true))).orderBy(asc(athleteContext.createdAt)),
    db().select().from(metricDefinitions).where(and(eq(metricDefinitions.athleteId, athleteId), eq(metricDefinitions.active, true))).orderBy(asc(metricDefinitions.displayName)),
    db().select().from(metricReadings).where(eq(metricReadings.athleteId, athleteId)).orderBy(desc(metricReadings.measuredAt)).limit(100),
  ]);
  return { athlete, entries, metrics: definitions.map(definition => ({ ...definition, readings: readings.filter(r => r.definitionId === definition.id) })) };
}

async function getPlanState(athleteId: string, planId?: string, weekStart?: string) {
  const filters = [eq(plans.athleteId, athleteId)];
  if (planId) filters.push(eq(plans.id, planId));
  if (weekStart) filters.push(eq(plans.weekStart, weekStart));
  const [plan] = await db().select().from(plans).where(and(...filters)).limit(1);
  if (!plan) throw new DomainError("NOT_FOUND", "Plan not found for this athlete");
  const versions = await db().select().from(planVersions).where(and(eq(planVersions.athleteId, athleteId), eq(planVersions.planId, plan.id))).orderBy(asc(planVersions.version));
  const current = versions.find(v => v.version === plan.version);
  const baseline = plan.baselineVersion ? versions.find(v => v.version === plan.baselineVersion) : undefined;
  if (!current) throw new DomainError("DATABASE", "Plan current version is missing");
  return { plan, versions, current, baseline };
}

function sessionFrom(payload: unknown, key: string) {
  const parsed = planPayloadSchema.parse(payload);
  const session = parsed.sessions.find(s => s.key === key);
  if (!session) throw new DomainError("NOT_FOUND", "Session not found in plan");
  return session;
}

export async function executeOperation(input: unknown): Promise<Result> {
  const op = operationSchema.parse(input);
  switch (op.operation) {
    case "listAthletes": return db().select().from(athletes).where(eq(athletes.active, true)).orderBy(asc(athletes.displayName));
    case "createAthlete": return idempotent(op, async () => {
      const [created] = await db().insert(athletes).values({ name: op.name, displayName: op.displayName, timezone: op.timezone }).returning();
      return created;
    });
    case "updateAthlete": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const [updated] = await db().update(athletes).set({ displayName: op.displayName, timezone: op.timezone, active: op.active, updatedAt: new Date() }).where(eq(athletes.id, op.athleteId)).returning();
      return updated;
    });
    case "getAthleteContext": return contextFor(op.athleteId);
    case "upsertPersona": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      return db().transaction(async tx => {
        await tx.update(athleteContext).set({ active: false, updatedAt: new Date() }).where(and(eq(athleteContext.athleteId, op.athleteId), eq(athleteContext.kind, "persona"), eq(athleteContext.active, true)));
        const [created] = await tx.insert(athleteContext).values({ athleteId: op.athleteId, kind: "persona", data: op.persona }).returning();
        return created;
      });
    });
    case "addContext": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const data = validateContext(op.kind, op.data);
      const [created] = await db().insert(athleteContext).values({ athleteId: op.athleteId, kind: op.kind, data }).returning();
      return created;
    });
    case "retireContext": return idempotent(op, async () => {
      const [updated] = await db().update(athleteContext).set({ active: false, updatedAt: new Date() }).where(and(eq(athleteContext.id, op.contextId), eq(athleteContext.athleteId, op.athleteId))).returning();
      if (!updated) throw new DomainError("NOT_FOUND", "Context entry not found for this athlete");
      return updated;
    });
    case "defineMetric": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const [created] = await db().insert(metricDefinitions).values({ athleteId: op.athleteId, ...op.definition }).returning();
      return created;
    });
    case "recordMetric": return idempotent(op, async () => {
      const [definition] = await db().select().from(metricDefinitions).where(and(eq(metricDefinitions.id, op.reading.definitionId), eq(metricDefinitions.athleteId, op.athleteId), eq(metricDefinitions.active, true))).limit(1);
      if (!definition) throw new DomainError("NOT_FOUND", "Metric definition not found for this athlete");
      const [created] = await db().insert(metricReadings).values({ athleteId: op.athleteId, definitionId: definition.id, measuredAt: new Date(op.reading.measuredAt), value: String(op.reading.value), source: `${op.reading.source.kind}:${op.reading.source.label}`, context: op.reading.context, confidence: op.reading.source.confidence }).returning();
      return created;
    });
    case "setWeeklyContext": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      if (op.entry.data.locationId) {
        const [location] = await db().select().from(athleteContext).where(and(eq(athleteContext.id, op.entry.data.locationId), eq(athleteContext.athleteId, op.athleteId), eq(athleteContext.kind, "location"), eq(athleteContext.active, true))).limit(1);
        if (!location) throw new DomainError("NOT_FOUND", "Location not found for this athlete");
      }
      const [created] = await db().insert(weeklyContext).values({ athleteId: op.athleteId, weekStart: op.entry.weekStart, kind: op.entry.kind, effectiveFrom: op.entry.effectiveFrom, effectiveTo: op.entry.effectiveTo, data: op.entry.data }).returning();
      return created;
    });
    case "getPlanningContext": {
      const foundation = await contextFor(op.athleteId);
      const [week, recentWorkouts, recentMetrics, latestReview, activeObservations] = await Promise.all([
        db().select().from(weeklyContext).where(and(eq(weeklyContext.athleteId, op.athleteId), eq(weeklyContext.weekStart, op.weekStart), eq(weeklyContext.active, true))).orderBy(asc(weeklyContext.effectiveFrom)),
        db().select().from(workouts).where(eq(workouts.athleteId, op.athleteId)).orderBy(desc(workouts.updatedAt)).limit(12),
        db().select().from(metricReadings).where(eq(metricReadings.athleteId, op.athleteId)).orderBy(desc(metricReadings.measuredAt)).limit(20),
        db().select().from(reviews).where(eq(reviews.athleteId, op.athleteId)).orderBy(desc(reviews.periodEnd)).limit(1),
        db().select().from(observations).where(and(eq(observations.athleteId, op.athleteId), eq(observations.active, true))).orderBy(desc(observations.updatedAt)).limit(10),
      ]);
      return { schemaVersion: "1.0", athleteId: op.athleteId, weekStart: op.weekStart, foundation, weeklyContext: week, recentActuals: recentWorkouts.map(w => ({ id: w.id, modality: w.modality, status: w.status, actual: w.actual, feedback: w.feedback, completedAt: w.completedAt })), recentMetrics, previousReview: latestReview[0] ?? null, activeObservations, missing: { review: !latestReview[0], actuals: recentWorkouts.length === 0, metrics: recentMetrics.length === 0 } };
    }
    case "createDraftPlan": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const existing = await db().select().from(plans).where(and(eq(plans.athleteId, op.athleteId), eq(plans.weekStart, op.weekStart))).limit(1);
      if (existing[0]) throw new DomainError("CONFLICT", "A plan already exists for this athlete and week");
      return db().transaction(async tx => {
        const [plan] = await tx.insert(plans).values({ athleteId: op.athleteId, weekStart: op.weekStart, rationale: op.plan.rationale }).returning();
        await tx.insert(planVersions).values({ planId: plan.id, athleteId: op.athleteId, version: 1, reason: "draft_created", payload: op.plan });
        return { ...plan, current: op.plan };
      });
    });
    case "reviseDraftPlan": return idempotent(op, async () => {
      const state = await getPlanState(op.athleteId, op.planId);
      if (state.plan.status !== "draft" || state.plan.version !== op.expectedVersion) throw new DomainError("CONFLICT", "Plan is locked or the version is stale");
      const next = state.plan.version + 1;
      return db().transaction(async tx => {
        const [updated] = await tx.update(plans).set({ version: next, rationale: op.plan.rationale, updatedAt: new Date() }).where(and(eq(plans.id, op.planId), eq(plans.athleteId, op.athleteId), eq(plans.status, "draft"), eq(plans.version, op.expectedVersion))).returning();
        if (!updated) throw new DomainError("CONFLICT", "Plan changed while revising");
        await tx.insert(planVersions).values({ planId: op.planId, athleteId: op.athleteId, version: next, reason: "draft_revised", payload: op.plan });
        return { ...updated, current: op.plan };
      });
    });
    case "lockPlan": return idempotent(op, async () => {
      const state = await getPlanState(op.athleteId, op.planId);
      if (state.plan.status !== "draft" || state.plan.version !== op.expectedVersion) throw new DomainError("CONFLICT", "Plan is already locked or the version is stale");
      const [updated] = await db().update(plans).set({ status: "locked", baselineVersion: state.plan.version, updatedAt: new Date() }).where(and(eq(plans.id, op.planId), eq(plans.athleteId, op.athleteId), eq(plans.status, "draft"), eq(plans.version, op.expectedVersion))).returning();
      if (!updated) throw new DomainError("CONFLICT", "Plan changed while locking");
      return { ...updated, baseline: state.current.payload };
    });
    case "adaptPlan": return idempotent(op, async () => {
      const state = await getPlanState(op.athleteId, op.planId);
      if (state.plan.status !== "locked" || state.plan.baselineVersion === null || state.plan.version !== op.expectedVersion) throw new DomainError("CONFLICT", "Only the current locked plan can be adapted");
      const next = state.plan.version + 1;
      return db().transaction(async tx => {
        const [updated] = await tx.update(plans).set({ version: next, rationale: op.plan.rationale, updatedAt: new Date() }).where(and(eq(plans.id, op.planId), eq(plans.athleteId, op.athleteId), eq(plans.status, "locked"), eq(plans.version, op.expectedVersion))).returning();
        if (!updated) throw new DomainError("CONFLICT", "Plan changed while adapting");
        await tx.insert(planVersions).values({ planId: op.planId, athleteId: op.athleteId, version: next, reason: `accepted_adaptation:${op.reason}`, payload: op.plan });
        return { ...updated, baseline: state.baseline?.payload, current: op.plan };
      });
    });
    case "getPlan": {
      const state = await getPlanState(op.athleteId, op.planId, op.weekStart);
      const workoutRows = await db().select().from(workouts).where(and(eq(workouts.athleteId, op.athleteId), eq(workouts.planId, state.plan.id)));
      return { ...state, workouts: workoutRows };
    }
    case "getToday": {
      await ensureAthlete(op.athleteId);
      const planRows = await db().select().from(plans).where(and(eq(plans.athleteId, op.athleteId), inArray(plans.status, ["draft", "locked"]))).orderBy(desc(plans.weekStart));
      for (const plan of planRows) {
        const state = await getPlanState(op.athleteId, plan.id);
        const session = planPayloadSchema.parse(state.current.payload).sessions.find(s => s.date === op.date);
        if (session) {
          const [workout] = await db().select().from(workouts).where(and(eq(workouts.athleteId, op.athleteId), eq(workouts.planId, plan.id), eq(workouts.sessionKey, session.key))).limit(1);
          return { date: op.date, plan, session, workout: workout ?? null, adapted: plan.baselineVersion !== null && plan.version !== plan.baselineVersion };
        }
      }
      return { date: op.date, session: null, missing: "No session planned for this date" };
    }
    case "createExercise": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const [created] = await db().insert(exercises).values({ athleteId: op.athleteId, canonicalName: op.canonicalName, aliases: op.aliases, category: op.category, equipment: op.equipment }).returning();
      return created;
    });
    case "getExerciseHistory": {
      await ensureAthlete(op.athleteId);
      const candidates = await db().select().from(exercises).where(or(eq(exercises.athleteId, op.athleteId), sql`${exercises.athleteId} IS NULL`));
      const needle = op.exerciseName.toLocaleLowerCase();
      const exercise = candidates.find(e => e.canonicalName.toLocaleLowerCase() === needle || e.aliases.some(a => a.toLocaleLowerCase() === needle));
      const filters = [eq(setActuals.athleteId, op.athleteId)];
      if (exercise) filters.push(or(eq(setActuals.exerciseId, exercise.id), sql`lower(${setActuals.exerciseName}) = ${exercise.canonicalName.toLocaleLowerCase()}`)!);
      else filters.push(sql`lower(${setActuals.exerciseName}) = ${needle}`);
      const history = await db().select().from(setActuals).where(and(...filters)).orderBy(desc(setActuals.updatedAt)).limit(40);
      return { exercise: exercise ?? { canonicalName: op.exerciseName }, actualSets: history, source: "actuals_only" };
    }
    case "startWorkout": return idempotent(op, async () => {
      const state = await getPlanState(op.athleteId, op.planId);
      if (state.plan.version !== op.expectedPlanVersion || state.plan.status !== "locked") throw new DomainError("CONFLICT", "Workout must start from the current locked plan");
      const effective = sessionFrom(state.current.payload, op.sessionKey);
      const original = sessionFrom(state.baseline?.payload ?? state.current.payload, op.sessionKey);
      const [existing] = await db().select().from(workouts).where(and(eq(workouts.athleteId, op.athleteId), eq(workouts.planId, op.planId), eq(workouts.sessionKey, op.sessionKey))).limit(1);
      if (existing) return existing;
      const [created] = await db().insert(workouts).values({ athleteId: op.athleteId, planId: op.planId, sessionKey: op.sessionKey, modality: effective.modality, status: "in_progress", originalPrescription: original, effectivePrescription: effective, startedAt: new Date() }).returning();
      return created;
    });
    case "adaptWorkout": return idempotent(op, async () => {
      const [workout] = await db().select().from(workouts).where(and(eq(workouts.id, op.workoutId), eq(workouts.athleteId, op.athleteId))).limit(1);
      if (!workout) throw new DomainError("NOT_FOUND", "Workout not found for this athlete");
      assertWorkoutMutable(workout.status, workout.version, op.expectedVersion);
      const [updated] = await db().update(workouts).set({ effectivePrescription: { ...op.effectivePrescription, adaptationReason: op.reason }, version: workout.version + 1, updatedAt: new Date() }).where(and(eq(workouts.id, op.workoutId), eq(workouts.athleteId, op.athleteId), eq(workouts.version, op.expectedVersion))).returning();
      if (!updated) throw new DomainError("CONFLICT", "Workout changed while adapting");
      return updated;
    });
    case "logSet": return idempotent(op, async () => {
      const [workout] = await db().select().from(workouts).where(and(eq(workouts.id, op.workoutId), eq(workouts.athleteId, op.athleteId))).limit(1);
      if (!workout) throw new DomainError("NOT_FOUND", "Workout not found for this athlete");
      assertWorkoutMutable(workout.status, workout.version, op.expectedVersion);
      if (op.exerciseId) {
        const [exercise] = await db().select().from(exercises).where(and(eq(exercises.id, op.exerciseId), or(eq(exercises.athleteId, op.athleteId), sql`${exercises.athleteId} IS NULL`))).limit(1);
        if (!exercise) throw new DomainError("NOT_FOUND", "Exercise not found for this athlete");
      }
      return db().transaction(async tx => {
        const [updatedWorkout] = await tx.update(workouts).set({ version: workout.version + 1, updatedAt: new Date() }).where(and(eq(workouts.id, op.workoutId), eq(workouts.athleteId, op.athleteId), eq(workouts.version, op.expectedVersion))).returning();
        if (!updatedWorkout) throw new DomainError("CONFLICT", "Workout changed while logging set");
        const [actual] = await tx.insert(setActuals).values({ athleteId: op.athleteId, workoutId: op.workoutId, exerciseId: op.exerciseId, exerciseName: op.exerciseName, setIndex: op.setIndex, reps: op.reps === undefined ? null : String(op.reps), load: op.load === undefined ? null : String(op.load), unit: op.unit }).onConflictDoUpdate({ target: [setActuals.workoutId, setActuals.exerciseName, setActuals.setIndex], set: { reps: op.reps === undefined ? null : String(op.reps), load: op.load === undefined ? null : String(op.load), unit: op.unit, updatedAt: new Date() } }).returning();
        return { workout: updatedWorkout, actual };
      });
    });
    case "completeWorkout": return idempotent(op, async () => {
      const [workout] = await db().select().from(workouts).where(and(eq(workouts.id, op.workoutId), eq(workouts.athleteId, op.athleteId))).limit(1);
      if (!workout) throw new DomainError("NOT_FOUND", "Workout not found for this athlete");
      assertWorkoutMutable(workout.status, workout.version, op.expectedVersion);
      return db().transaction(async tx => {
        const [updated] = await tx.update(workouts).set({ status: op.outcome, actual: op.actual ?? null, feedback: op.feedback ?? null, evidence: op.evidence, completedAt: new Date(), version: workout.version + 1, updatedAt: new Date() }).where(and(eq(workouts.id, op.workoutId), eq(workouts.athleteId, op.athleteId), eq(workouts.version, op.expectedVersion))).returning();
        if (!updated) throw new DomainError("CONFLICT", "Workout changed while completing");
        if (op.coachInterpretation) await tx.insert(observations).values({ athleteId: op.athleteId, text: op.coachInterpretation, evidenceRefs: [`workout:${op.workoutId}`] });
        return updated;
      });
    });
    case "getProgress": {
      await ensureAthlete(op.athleteId);
      const [planRows, workoutRows, readingRows, contextRows, reviewRows, observationRows] = await Promise.all([
        db().select().from(plans).where(and(eq(plans.athleteId, op.athleteId), gte(plans.weekStart, op.periodStart), lte(plans.weekStart, op.periodEnd))).orderBy(asc(plans.weekStart)),
        db().select().from(workouts).where(eq(workouts.athleteId, op.athleteId)).orderBy(desc(workouts.updatedAt)).limit(100),
        db().select().from(metricReadings).where(and(eq(metricReadings.athleteId, op.athleteId), gte(metricReadings.measuredAt, new Date(`${op.periodStart}T00:00:00Z`)), lte(metricReadings.measuredAt, new Date(`${op.periodEnd}T23:59:59Z`)))).orderBy(asc(metricReadings.measuredAt)),
        db().select().from(athleteContext).where(and(eq(athleteContext.athleteId, op.athleteId), eq(athleteContext.active, true), inArray(athleteContext.kind, ["goal", "event"]))),
        db().select().from(reviews).where(and(eq(reviews.athleteId, op.athleteId), lte(reviews.periodStart, op.periodEnd), gte(reviews.periodEnd, op.periodStart))).orderBy(desc(reviews.periodEnd)),
        db().select().from(observations).where(and(eq(observations.athleteId, op.athleteId), eq(observations.active, true))).orderBy(desc(observations.updatedAt)),
      ]);
      const scopedWorkouts = workoutRows.filter(w => planRows.some(p => p.id === w.planId));
      const counts = { planned: 0, completed: 0, partial: 0, skipped: 0, missed: 0, inProgress: 0 };
      for (const plan of planRows) counts.planned += planPayloadSchema.parse((await getPlanState(op.athleteId, plan.id)).current.payload).sessions.length;
      for (const workout of scopedWorkouts) {
        if (workout.status === "completed") counts.completed++;
        else if (workout.status === "partial") counts.partial++;
        else if (workout.status === "skipped") counts.skipped++;
        else if (workout.status === "missed") counts.missed++;
        else if (workout.status === "in_progress") counts.inProgress++;
      }
      const modality = ["strength", "run", "cycle"].map(kind => ({ kind, workouts: scopedWorkouts.filter(w => w.modality === kind).map(w => ({ id: w.id, status: w.status, actual: w.actual, feedback: w.feedback, completedAt: w.completedAt })) }));
      return { schemaVersion: "1.0", athleteId: op.athleteId, period: { start: op.periodStart, end: op.periodEnd }, factualSummary: counts, modality, metrics: readingRows, goalsAndEvents: contextRows, coachReviews: reviewRows, activeObservations: observationRows, evidenceSufficient: planRows.length > 0 || readingRows.length > 0 };
    }
    case "createReview": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const [created] = await db().insert(reviews).values({ athleteId: op.athleteId, periodStart: op.periodStart, periodEnd: op.periodEnd, summary: op.summary, goalAssessments: op.goalAssessments, recommendedDirection: op.recommendedDirection, evidenceRefs: op.evidenceRefs }).returning();
      return created;
    });
    case "addObservation": return idempotent(op, async () => {
      await ensureAthlete(op.athleteId);
      const [created] = await db().insert(observations).values({ athleteId: op.athleteId, text: op.text, evidenceRefs: op.evidenceRefs }).returning();
      return created;
    });
    case "retireObservation": return idempotent(op, async () => {
      const [updated] = await db().update(observations).set({ active: false, retiredAt: new Date(), updatedAt: new Date() }).where(and(eq(observations.id, op.observationId), eq(observations.athleteId, op.athleteId))).returning();
      if (!updated) throw new DomainError("NOT_FOUND", "Observation not found for this athlete");
      return updated;
    });
  }
}
