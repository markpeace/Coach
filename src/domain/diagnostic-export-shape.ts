import {
  athleteContext,
  athletes,
  decisionTraces,
  exercises,
  metricDefinitions,
  metricReadings,
  observations,
  plans,
  planVersions,
  reviews,
  setActuals,
  weeklyContext,
  workouts,
} from "@/db/schema";

export const DIAGNOSTIC_EXPORT_FORMAT = "coach-athlete-diagnostic-export";
export const DIAGNOSTIC_EXPORT_VERSION = "1.0.0";

export type DiagnosticExportRows = {
  athlete: typeof athletes.$inferSelect;
  athleteContext: Array<typeof athleteContext.$inferSelect>;
  metricDefinitions: Array<typeof metricDefinitions.$inferSelect>;
  metricReadings: Array<typeof metricReadings.$inferSelect>;
  weeklyContext: Array<typeof weeklyContext.$inferSelect>;
  plans: Array<typeof plans.$inferSelect>;
  planVersions: Array<typeof planVersions.$inferSelect>;
  exercises: Array<typeof exercises.$inferSelect>;
  workouts: Array<typeof workouts.$inferSelect>;
  setActuals: Array<typeof setActuals.$inferSelect>;
  reviews: Array<typeof reviews.$inferSelect>;
  observations: Array<typeof observations.$inferSelect>;
  decisionTraces: Array<typeof decisionTraces.$inferSelect>;
};

function scoped<T extends { athleteId: string | null }>(rows: T[], athleteId: string) {
  return rows.filter((row) => row.athleteId === athleteId);
}

export function assembleAthleteDiagnosticExport(input: DiagnosticExportRows, generatedAt = new Date()) {
  const athleteId = input.athlete.id;
  const ledger = {
    athleteContext: scoped(input.athleteContext, athleteId),
    metricDefinitions: scoped(input.metricDefinitions, athleteId),
    metricReadings: scoped(input.metricReadings, athleteId),
    weeklyContext: scoped(input.weeklyContext, athleteId),
    plans: scoped(input.plans, athleteId),
    planVersions: scoped(input.planVersions, athleteId),
    exercises: scoped(input.exercises, athleteId),
    workouts: scoped(input.workouts, athleteId),
    setActuals: scoped(input.setActuals, athleteId),
    reviews: scoped(input.reviews, athleteId),
    observations: scoped(input.observations, athleteId),
    decisionTraces: scoped(input.decisionTraces, athleteId),
  };

  const rowCounts = Object.fromEntries(Object.entries(ledger).map(([name, rows]) => [name, rows.length]));
  const timeline = ledger.decisionTraces.map((trace) => ({
    occurredAt: trace.occurredAt,
    traceId: trace.id,
    interactionId: trace.interactionId,
    decisionType: trace.decisionType,
    userIntentSummary: trace.userIntentSummary,
    decisionSummary: trace.decisionSummary,
    evidenceRefs: trace.evidenceRefs,
    outputRefs: trace.outputRefs,
  }));

  return {
    manifest: {
      format: DIAGNOSTIC_EXPORT_FORMAT,
      version: DIAGNOSTIC_EXPORT_VERSION,
      generatedAt: generatedAt.toISOString(),
      athleteId,
      exportedSections: Object.keys(ledger),
      rowCounts,
      provenance: "Source, evidence and runtime metadata already present on canonical Coach records are preserved verbatim in the ledger sections.",
      excludedByDesign: [
        "OAuth codes and tokens",
        "household credentials and session data",
        "global migration records",
        "idempotency records and payloads",
        "raw full transcripts",
        "hidden chain-of-thought or scratch reasoning",
        "other athletes' state",
      ],
    },
    athlete: input.athlete,
    ledger,
    timeline,
  };
}
