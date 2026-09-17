CREATE TABLE "decision_traces" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "athlete_id" uuid NOT NULL REFERENCES "athletes"("id") ON DELETE CASCADE,
  "interaction_id" uuid NOT NULL DEFAULT gen_random_uuid(),
  "decision_type" text NOT NULL,
  "occurred_at" timestamptz NOT NULL DEFAULT now(),
  "user_intent_summary" text,
  "decision_summary" text NOT NULL,
  "rationale_summary" text NOT NULL,
  "evidence_refs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "assumptions" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "uncertainty" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "output_refs" jsonb NOT NULL DEFAULT '[]'::jsonb,
  "runtime_metadata" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "trace_schema_version" integer NOT NULL DEFAULT 1,
  "created_at" timestamptz NOT NULL DEFAULT now(),
  "updated_at" timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX "decision_traces_athlete_time" ON "decision_traces"("athlete_id", "occurred_at" DESC);
