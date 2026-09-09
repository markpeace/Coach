CREATE TYPE "plan_status" AS ENUM ('draft', 'locked', 'completed', 'superseded');
CREATE TYPE "workout_status" AS ENUM ('not_started', 'in_progress', 'completed', 'partial', 'skipped', 'missed');

CREATE TABLE "athletes" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "name" text NOT NULL, "display_name" text NOT NULL,
  "timezone" text NOT NULL DEFAULT 'Europe/London', "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "athlete_context" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "kind" text NOT NULL, "data" jsonb NOT NULL, "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "metric_definitions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "key" text NOT NULL, "display_name" text NOT NULL, "unit" text NOT NULL, "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "metric_def_athlete_key" ON "metric_definitions"("athlete_id", "key");
CREATE TABLE "metric_readings" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "definition_id" uuid NOT NULL REFERENCES "metric_definitions"("id") ON DELETE CASCADE, "measured_at" timestamptz NOT NULL,
  "value" numeric NOT NULL, "source" text NOT NULL, "context" text, "confidence" text,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "weekly_context" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "week_start" date NOT NULL, "kind" text NOT NULL, "effective_from" date NOT NULL, "effective_to" date NOT NULL,
  "data" jsonb NOT NULL, "active" boolean NOT NULL DEFAULT true,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "plans" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "week_start" date NOT NULL, "status" plan_status NOT NULL DEFAULT 'draft', "version" integer NOT NULL DEFAULT 1,
  "baseline_version" integer, "rationale" text,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "plan_athlete_week" ON "plans"("athlete_id", "week_start");
CREATE TABLE "plan_versions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "plan_id" uuid NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE,
  "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE, "version" integer NOT NULL,
  "reason" text NOT NULL, "payload" jsonb NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "plan_version_unique" ON "plan_versions"("plan_id", "version");
CREATE TABLE "exercises" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid REFERENCES "athletes"("id") ON DELETE CASCADE,
  "canonical_name" text NOT NULL, "aliases" jsonb NOT NULL DEFAULT '[]'::jsonb, "category" text NOT NULL, "equipment" text,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "workouts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "plan_id" uuid NOT NULL REFERENCES "plans"("id") ON DELETE CASCADE, "session_key" text NOT NULL, "modality" text NOT NULL,
  "status" workout_status NOT NULL DEFAULT 'not_started', "version" integer NOT NULL DEFAULT 1,
  "original_prescription" jsonb NOT NULL, "effective_prescription" jsonb NOT NULL, "actual" jsonb, "feedback" jsonb, "evidence" jsonb,
  "started_at" timestamptz, "completed_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "workout_plan_session" ON "workouts"("plan_id", "session_key");
CREATE TABLE "set_actuals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "workout_id" uuid NOT NULL REFERENCES "workouts"("id") ON DELETE CASCADE, "exercise_id" uuid REFERENCES "exercises"("id"),
  "exercise_name" text NOT NULL, "set_index" integer NOT NULL, "reps" numeric, "load" numeric, "unit" text,
  "completed" boolean NOT NULL DEFAULT true, "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "set_actual_unique" ON "set_actuals"("workout_id", "exercise_name", "set_index");
CREATE TABLE "reviews" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "period_start" date NOT NULL, "period_end" date NOT NULL, "summary" text NOT NULL,
  "goal_assessments" jsonb NOT NULL DEFAULT '[]'::jsonb, "recommended_direction" text NOT NULL,
  "evidence_refs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "observations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(), "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "text" text NOT NULL, "evidence_refs" jsonb NOT NULL DEFAULT '[]'::jsonb, "active" boolean NOT NULL DEFAULT true, "retired_at" timestamptz,
  "created_at" timestamptz NOT NULL DEFAULT now(), "updated_at" timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE "idempotency" (
  "key" text PRIMARY KEY, "operation" text NOT NULL, "athlete_id" uuid REFERENCES "athletes"("id") ON DELETE CASCADE,
  "request_hash" text NOT NULL, "response" jsonb NOT NULL, "created_at" timestamptz NOT NULL DEFAULT now()
);
