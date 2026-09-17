import { describe, expect, it } from "vitest";
import { assembleAthleteDiagnosticExport, type DiagnosticExportRows } from "@/domain/diagnostic-export-shape";

const TARGET = "00000000-0000-4000-8000-000000000001";
const OTHER = "00000000-0000-4000-8000-000000000002";
const owned = (athleteId: string, id: string) => ({ id, athleteId });
const pair = (prefix: string) => [owned(TARGET, `${prefix}-target`), owned(OTHER, `${prefix}-other`)];

describe("athlete diagnostic export shape", () => {
  it("keeps every exported ledger section athlete-scoped and complete", () => {
    const input = {
      athlete: { id: TARGET, displayName: "Mark" },
      athleteContext: pair("context"),
      metricDefinitions: pair("metric-def"),
      metricReadings: pair("metric-reading"),
      weeklyContext: pair("week"),
      plans: pair("plan"),
      planVersions: pair("plan-version"),
      exercises: pair("exercise"),
      workouts: pair("workout"),
      setActuals: pair("set"),
      reviews: pair("review"),
      observations: pair("observation"),
      decisionTraces: [
        {
          ...owned(TARGET, "trace-target"),
          interactionId: "00000000-0000-4000-8000-000000000010",
          occurredAt: new Date("2026-09-17T20:23:00Z"),
          decisionType: "progression",
          userIntentSummary: "Progress the next relevant session",
          decisionSummary: "Hold load and complete the rep target",
          evidenceRefs: [{ type: "set_actual", id: "set-target" }],
          outputRefs: [{ type: "plan", id: "plan-target", version: 4 }],
        },
        {
          ...owned(OTHER, "trace-other"),
          interactionId: "00000000-0000-4000-8000-000000000011",
          occurredAt: new Date("2026-09-17T20:24:00Z"),
          decisionType: "review",
          userIntentSummary: "Other athlete",
          decisionSummary: "Must not leak",
          evidenceRefs: [],
          outputRefs: [],
        },
      ],
    } as unknown as DiagnosticExportRows;

    const exported = assembleAthleteDiagnosticExport(input, new Date("2026-09-17T21:00:00Z"));
    expect(Object.keys(exported.ledger).sort()).toEqual([
      "athleteContext",
      "decisionTraces",
      "exercises",
      "metricDefinitions",
      "metricReadings",
      "observations",
      "plans",
      "planVersions",
      "reviews",
      "setActuals",
      "weeklyContext",
      "workouts",
    ]);
    for (const rows of Object.values(exported.ledger)) {
      expect(rows).toHaveLength(1);
      expect(rows[0].athleteId).toBe(TARGET);
    }
    expect(exported.manifest.athleteId).toBe(TARGET);
    expect(exported.manifest.rowCounts.decisionTraces).toBe(1);
  });

  it("derives a compact decision timeline and excludes operational/secret sections", () => {
    const input = {
      athlete: { id: TARGET, displayName: "Mark" },
      athleteContext: [], metricDefinitions: [], metricReadings: [], weeklyContext: [], plans: [], planVersions: [], exercises: [], workouts: [], setActuals: [], reviews: [], observations: [],
      decisionTraces: [{
        ...owned(TARGET, "trace-1"),
        interactionId: "00000000-0000-4000-8000-000000000010",
        occurredAt: new Date("2026-09-17T20:23:00Z"),
        decisionType: "progression",
        userIntentSummary: "Review recent actuals",
        decisionSummary: "Close the rep gap before adding load",
        evidenceRefs: [{ type: "set_actual", id: "set-1" }],
        outputRefs: [{ type: "plan", id: "plan-1", version: 4 }],
      }],
    } as unknown as DiagnosticExportRows;

    const exported = assembleAthleteDiagnosticExport(input);
    expect(exported.timeline).toHaveLength(1);
    expect(exported.timeline[0]).toMatchObject({ traceId: "trace-1", userIntentSummary: "Review recent actuals", outputRefs: [{ type: "plan", id: "plan-1", version: 4 }] });
    const topLevel = Object.keys(exported);
    const ledgerKeys = Object.keys(exported.ledger);
    for (const forbidden of ["idempotency", "mcpOauthCodes", "oauthCodes", "coachMigrations", "sessions", "tokens", "transcripts", "chainOfThought"]) {
      expect(topLevel).not.toContain(forbidden);
      expect(ledgerKeys).not.toContain(forbidden);
    }
  });
});
