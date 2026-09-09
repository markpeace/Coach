import { boolean, date, integer, jsonb, numeric, pgEnum, pgTable, text, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const planStatus = pgEnum("plan_status", ["draft", "locked", "completed", "superseded"]);
export const workoutStatus = pgEnum("workout_status", ["not_started", "in_progress", "completed", "partial", "skipped", "missed"]);

const audit = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
};

export const athletes = pgTable("athletes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  displayName: text("display_name").notNull(),
  timezone: text("timezone").notNull().default("Europe/London"),
  active: boolean("active").notNull().default(true),
  ...audit,
});

export const athleteContext = pgTable("athlete_context", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  kind: text("kind").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  active: boolean("active").notNull().default(true),
  ...audit,
});

export const metricDefinitions = pgTable("metric_definitions", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  key: text("key").notNull(),
  displayName: text("display_name").notNull(),
  unit: text("unit").notNull(),
  active: boolean("active").notNull().default(true),
  ...audit,
}, (t) => [uniqueIndex("metric_def_athlete_key").on(t.athleteId, t.key)]);

export const metricReadings = pgTable("metric_readings", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  definitionId: uuid("definition_id").notNull().references(() => metricDefinitions.id, { onDelete: "cascade" }),
  measuredAt: timestamp("measured_at", { withTimezone: true }).notNull(),
  value: numeric("value").notNull(),
  source: text("source").notNull(),
  context: text("context"),
  confidence: text("confidence"),
  ...audit,
});

export const weeklyContext = pgTable("weekly_context", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  kind: text("kind").notNull(),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to").notNull(),
  data: jsonb("data").$type<Record<string, unknown>>().notNull(),
  active: boolean("active").notNull().default(true),
  ...audit,
});

export const plans = pgTable("plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  weekStart: date("week_start").notNull(),
  status: planStatus("status").notNull().default("draft"),
  version: integer("version").notNull().default(1),
  baselineVersion: integer("baseline_version"),
  rationale: text("rationale"),
  ...audit,
}, (t) => [uniqueIndex("plan_athlete_week").on(t.athleteId, t.weekStart)]);

export const planVersions = pgTable("plan_versions", {
  id: uuid("id").primaryKey().defaultRandom(),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  version: integer("version").notNull(),
  reason: text("reason").notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
  ...audit,
}, (t) => [uniqueIndex("plan_version_unique").on(t.planId, t.version)]);

export const exercises = pgTable("exercises", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").references(() => athletes.id, { onDelete: "cascade" }),
  canonicalName: text("canonical_name").notNull(),
  aliases: jsonb("aliases").$type<string[]>().notNull().default([]),
  category: text("category").notNull(),
  equipment: text("equipment"),
  ...audit,
});

export const workouts = pgTable("workouts", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  planId: uuid("plan_id").notNull().references(() => plans.id, { onDelete: "cascade" }),
  sessionKey: text("session_key").notNull(),
  modality: text("modality").notNull(),
  status: workoutStatus("status").notNull().default("not_started"),
  version: integer("version").notNull().default(1),
  originalPrescription: jsonb("original_prescription").$type<Record<string, unknown>>().notNull(),
  effectivePrescription: jsonb("effective_prescription").$type<Record<string, unknown>>().notNull(),
  actual: jsonb("actual").$type<Record<string, unknown>>(),
  feedback: jsonb("feedback").$type<Record<string, unknown>>(),
  evidence: jsonb("evidence").$type<Record<string, unknown>[]>(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  ...audit,
}, (t) => [uniqueIndex("workout_plan_session").on(t.planId, t.sessionKey)]);

export const setActuals = pgTable("set_actuals", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  workoutId: uuid("workout_id").notNull().references(() => workouts.id, { onDelete: "cascade" }),
  exerciseId: uuid("exercise_id").references(() => exercises.id),
  exerciseName: text("exercise_name").notNull(),
  setIndex: integer("set_index").notNull(),
  reps: numeric("reps"),
  load: numeric("load"),
  unit: text("unit"),
  completed: boolean("completed").notNull().default(true),
  ...audit,
}, (t) => [uniqueIndex("set_actual_unique").on(t.workoutId, t.exerciseName, t.setIndex)]);

export const reviews = pgTable("reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  summary: text("summary").notNull(),
  goalAssessments: jsonb("goal_assessments").$type<Record<string, unknown>[]>().notNull().default([]),
  recommendedDirection: text("recommended_direction").notNull(),
  evidenceRefs: jsonb("evidence_refs").$type<string[]>().notNull().default([]),
  ...audit,
});

export const observations = pgTable("observations", {
  id: uuid("id").primaryKey().defaultRandom(),
  athleteId: uuid("athlete_id").notNull().references(() => athletes.id, { onDelete: "cascade" }),
  text: text("text").notNull(),
  evidenceRefs: jsonb("evidence_refs").$type<string[]>().notNull().default([]),
  active: boolean("active").notNull().default(true),
  retiredAt: timestamp("retired_at", { withTimezone: true }),
  ...audit,
});

export const idempotency = pgTable("idempotency", {
  key: text("key").primaryKey(),
  operation: text("operation").notNull(),
  athleteId: uuid("athlete_id").references(() => athletes.id, { onDelete: "cascade" }),
  requestHash: text("request_hash").notNull(),
  response: jsonb("response").$type<Record<string, unknown>>().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
