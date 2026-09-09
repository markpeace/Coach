import { z } from "zod";

export const uuid = z.string().uuid();
export const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
export const sourceSchema = z.object({
  kind: z.enum(["manual", "conversation", "athlete_evidence", "system"]),
  label: z.string().min(1).max(120),
  capturedAt: z.string().datetime().optional(),
  confidence: z.enum(["high", "medium", "low"]).optional(),
});

export const coachPersonaSchema = z.object({
  coachName: z.string().min(1).max(40),
  styleBrief: z.string().min(1).max(500),
  warmth: z.enum(["low", "balanced", "high"]).default("balanced"),
  explanation: z.enum(["concise", "balanced", "detailed"]).default("balanced"),
  challenge: z.enum(["restrained", "balanced", "challenging"]).default("balanced"),
});
export const prioritySchema = z.object({
  area: z.string().min(1).max(80),
  level: z.enum(["primary", "develop", "maintain", "not_prioritised"]),
  note: z.string().max(300).optional(),
});
export const preferenceSchema = z.object({ text: z.string().min(1).max(300) });
export const goalSchema = z.object({
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(800),
  type: z.enum(["performance", "physique", "health_fitness", "body_composition", "capability"]),
  status: z.enum(["active", "achieved", "paused", "retired"]).default("active"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  baseline: z.string().max(300).optional(),
  targetValue: z.number().optional(),
  targetUnit: z.string().max(30).optional(),
  qualitativeTarget: z.string().max(500).optional(),
  targetDate: isoDate.optional(),
  indicators: z.array(z.string().max(160)).max(10).default([]),
  coachAssessment: z.object({
    status: z.enum(["progressing_well", "progressing", "unclear", "stalled", "needs_review"]),
    summary: z.string().max(400),
    assessedAt: z.string().datetime(),
    evidenceRefs: z.array(z.string()).max(20).default([]),
  }).optional(),
});
export const eventSchema = z.object({
  name: z.string().min(1).max(120), type: z.string().min(1).max(80), date: isoDate,
  details: z.string().max(500).optional(), targetOutcome: z.string().max(300).optional(),
  linkedGoalIds: z.array(uuid).max(10).default([]),
});
export const locationSchema = z.object({
  name: z.string().min(1).max(100), kind: z.enum(["home", "gym", "outdoors", "travel", "other"]),
  temporary: z.boolean().default(false),
  equipment: z.array(z.object({ name: z.string().min(1).max(100), type: z.string().min(1).max(80), attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).default({}) })).max(60).default([]),
});
export const metricDefinitionSchema = z.object({ key: z.string().regex(/^[a-z0-9_]+$/), displayName: z.string().min(1).max(80), unit: z.string().min(1).max(30) });
export const metricReadingSchema = z.object({ definitionId: uuid, measuredAt: z.string().datetime(), value: z.number(), source: sourceSchema, context: z.string().max(300).optional() });

export const weeklyContextEntrySchema = z.object({
  kind: z.enum(["availability", "anchor", "temporary"]), weekStart: isoDate,
  effectiveFrom: isoDate, effectiveTo: isoDate,
  data: z.object({ date: isoDate.optional(), durationMinutes: z.number().int().positive().max(600).optional(), window: z.string().max(80).optional(), locationId: uuid.optional(), title: z.string().max(120).optional(), note: z.string().max(500).optional() }),
});

export const strengthExerciseSchema = z.object({
  exerciseId: uuid.optional(), exerciseName: z.string().min(1).max(120), cue: z.string().max(240).optional(),
  sets: z.array(z.object({ reps: z.union([z.number().int().positive(), z.string().min(1).max(30)]), load: z.number().nonnegative().optional(), unit: z.string().max(20).optional(), restSeconds: z.number().int().nonnegative().max(1200).optional() })).min(1).max(20),
});
const commonSession = z.object({
  key: z.string().regex(/^[a-z0-9_-]+$/), date: isoDate, title: z.string().min(1).max(120),
  intendedStimulus: z.string().min(1).max(300), locationId: uuid.optional(), durationMinutes: z.number().int().positive().max(600),
  coachCue: z.string().max(400).optional(), rationale: z.string().max(600).optional(),
});
export const planSessionSchema = z.discriminatedUnion("modality", [
  commonSession.extend({ modality: z.literal("strength"), prescription: z.object({ exercises: z.array(strengthExerciseSchema).min(1).max(30) }) }),
  commonSession.extend({ modality: z.literal("run"), prescription: z.object({ durationMinutes: z.number().positive().optional(), distanceKm: z.number().positive().optional(), intensity: z.string().min(1).max(120), paceOrZone: z.string().max(80).optional(), intervals: z.array(z.string().max(120)).max(30).optional(), strides: z.string().max(120).optional() }) }),
  commonSession.extend({ modality: z.literal("cycle"), prescription: z.object({ durationMinutes: z.number().positive(), intensity: z.string().min(1).max(120), powerGuidance: z.string().max(120).optional(), zwiftWorkout: z.string().max(160).optional() }) }),
]);
export const planPayloadSchema = z.object({ rationale: z.string().min(1).max(1200), sessions: z.array(planSessionSchema).max(14) });

export const workoutActualSchema = z.object({
  durationMinutes: z.number().nonnegative().optional(), distanceKm: z.number().nonnegative().optional(), pace: z.string().max(40).optional(),
  averageHeartRate: z.number().int().min(20).max(250).optional(), averagePower: z.number().nonnegative().optional(),
  result: z.string().max(300).optional(), source: sourceSchema,
});
export const feedbackSchema = z.object({ difficulty: z.enum(["easy", "about_right", "hard", "very_hard"]), note: z.string().max(1000).optional() });
export const evidenceSchema = z.object({ source: sourceSchema, description: z.string().min(1).max(300), fields: z.array(z.string()).max(40), retainedRaw: z.literal(false).default(false) });

const withAthlete = z.object({ athleteId: uuid });
const withIdempotency = z.object({ idempotencyKey: z.string().min(8).max(200) });
export const operationSchema = z.discriminatedUnion("operation", [
  z.object({ operation: z.literal("listAthletes") }),
  z.object({ operation: z.literal("createAthlete"), name: z.string().min(1).max(80), displayName: z.string().min(1).max(80), timezone: z.string().min(1).max(80) }).merge(withIdempotency),
  z.object({ operation: z.literal("updateAthlete"), displayName: z.string().min(1).max(80).optional(), timezone: z.string().min(1).max(80).optional(), active: z.boolean().optional() }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("getAthleteContext") }).merge(withAthlete),
  z.object({ operation: z.literal("upsertPersona"), persona: coachPersonaSchema }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("addContext"), kind: z.enum(["priority", "preference", "goal", "event", "location"]), data: z.record(z.string(), z.unknown()) }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("retireContext"), contextId: uuid }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("defineMetric"), definition: metricDefinitionSchema }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("recordMetric"), reading: metricReadingSchema }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("setWeeklyContext"), entry: weeklyContextEntrySchema }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("getPlanningContext"), weekStart: isoDate }).merge(withAthlete),
  z.object({ operation: z.literal("createDraftPlan"), weekStart: isoDate, plan: planPayloadSchema }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("reviseDraftPlan"), planId: uuid, expectedVersion: z.number().int().positive(), plan: planPayloadSchema }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("lockPlan"), planId: uuid, expectedVersion: z.number().int().positive(), confirmation: z.literal("lock") }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("adaptPlan"), planId: uuid, expectedVersion: z.number().int().positive(), reason: z.string().min(1).max(500), plan: planPayloadSchema, accepted: z.literal(true) }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("getPlan"), weekStart: isoDate.optional(), planId: uuid.optional() }).merge(withAthlete),
  z.object({ operation: z.literal("getToday"), date: isoDate }).merge(withAthlete),
  z.object({ operation: z.literal("createExercise"), canonicalName: z.string().min(1).max(120), aliases: z.array(z.string().max(120)).max(20).default([]), category: z.string().min(1).max(80), equipment: z.string().max(80).optional() }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("getExerciseHistory"), exerciseName: z.string().min(1).max(120) }).merge(withAthlete),
  z.object({ operation: z.literal("startWorkout"), planId: uuid, sessionKey: z.string().min(1), expectedPlanVersion: z.number().int().positive() }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("adaptWorkout"), workoutId: uuid, expectedVersion: z.number().int().positive(), reason: z.string().min(1).max(500), effectivePrescription: z.record(z.string(), z.unknown()), accepted: z.literal(true) }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("logSet"), workoutId: uuid, expectedVersion: z.number().int().positive(), exerciseId: uuid.optional(), exerciseName: z.string().min(1).max(120), setIndex: z.number().int().positive(), reps: z.number().nonnegative().optional(), load: z.number().nonnegative().optional(), unit: z.string().max(20).optional() }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("completeWorkout"), workoutId: uuid, expectedVersion: z.number().int().positive(), outcome: z.enum(["completed", "partial", "skipped", "missed"]), actual: workoutActualSchema.optional(), feedback: feedbackSchema.optional(), evidence: z.array(evidenceSchema).max(10).default([]), coachInterpretation: z.string().max(600).optional() }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("getProgress"), periodStart: isoDate, periodEnd: isoDate }).merge(withAthlete),
  z.object({ operation: z.literal("createReview"), periodStart: isoDate, periodEnd: isoDate, summary: z.string().min(1).max(1200), goalAssessments: z.array(z.object({ goalId: uuid, status: z.enum(["progressing_well", "progressing", "unclear", "stalled", "needs_review"]), summary: z.string().max(400) })).max(30), recommendedDirection: z.string().min(1).max(800), evidenceRefs: z.array(z.string()).max(40) }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("addObservation"), text: z.string().min(1).max(600), evidenceRefs: z.array(z.string()).max(30) }).merge(withAthlete).merge(withIdempotency),
  z.object({ operation: z.literal("retireObservation"), observationId: uuid }).merge(withAthlete).merge(withIdempotency),
]);

export type CoachOperation = z.infer<typeof operationSchema>;
export type PlanPayload = z.infer<typeof planPayloadSchema>;
export type PlanSession = z.infer<typeof planSessionSchema>;

export function validateContext(kind: "priority" | "preference" | "goal" | "event" | "location", data: Record<string, unknown>) {
  return ({ priority: prioritySchema, preference: preferenceSchema, goal: goalSchema, event: eventSchema, location: locationSchema } as const)[kind].parse(data);
}
