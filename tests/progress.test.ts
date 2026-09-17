import { describe, expect, it } from "vitest";
import { buildMetricSeries, buildPlanReality, buildStrengthAnchors, summarisePlanReality } from "@/domain/progress";

const plan = {
  id: "plan-a",
  weekStart: "2026-09-14",
  status: "locked",
  currentPayload: {
    rationale: "Generic mixed week",
    sessions: [
      { key: "one", date: "2026-09-14", title: "First session", intendedStimulus: "Strength", durationMinutes: 45, modality: "strength", prescription: { exercises: [{ exerciseName: "Press", sets: [{ reps: 8, load: 20, unit: "kg" }] }] } },
      { key: "two", date: "2026-09-16", title: "Second session", intendedStimulus: "Strength", durationMinutes: 30, modality: "strength", prescription: { exercises: [{ exerciseName: "Row", sets: [{ reps: 10, load: 30, unit: "kg" }] }] } },
    ],
  },
};

describe("progress model", () => {
  it("matches arbitrary plan sessions to their own workouts without assuming weekdays or exercise names", () => {
    const sessions = buildPlanReality([plan], [
      { id: "workout-a", planId: "plan-a", sessionKey: "one", modality: "strength", status: "completed", actual: { durationMinutes: 42 }, feedback: null, completedAt: "2026-09-14T10:00:00Z" },
      { id: "other-plan", planId: "plan-b", sessionKey: "two", modality: "strength", status: "completed", actual: { durationMinutes: 30 }, feedback: null, completedAt: "2026-09-16T10:00:00Z" },
    ]);
    expect(sessions.map(session => session.status)).toEqual(["completed", "planned"]);
    expect(summarisePlanReality(sessions)).toEqual({ planned: 2, completed: 1, partial: 0, skipped: 0, missed: 0, inProgress: 0 });
  });

  it("labels arbitrary metric readings from their definitions and preserves sparse history", () => {
    const series = buildMetricSeries(
      [
        { id: "m1", key: "custom-one", displayName: "Custom one", unit: "widgets" },
        { id: "m2", key: "custom-two", displayName: "Custom two", unit: "points" },
      ],
      [
        { id: "r2", definitionId: "m1", measuredAt: "2026-09-02T00:00:00Z", value: "12", source: "manual:test", context: null, confidence: null },
        { id: "r1", definitionId: "m1", measuredAt: "2026-09-01T00:00:00Z", value: "10", source: "manual:test", context: null, confidence: null },
        { id: "r3", definitionId: "m2", measuredAt: "2026-09-03T00:00:00Z", value: "7", source: "manual:test", context: null, confidence: null },
      ],
    );
    expect(series[0].readings.map(reading => reading.value)).toEqual([10, 12]);
    expect(series[1].readings).toHaveLength(1);
  });

  it("builds strength history only from completed workout actuals and stays exercise-generic", () => {
    const workouts = [
      { id: "done", planId: "p", sessionKey: "a", modality: "strength", status: "completed", actual: null, feedback: null, completedAt: "2026-09-10T10:00:00Z" },
      { id: "open", planId: "p", sessionKey: "b", modality: "strength", status: "in_progress", actual: null, feedback: null, completedAt: null },
    ];
    const anchors = buildStrengthAnchors(workouts, [
      { id: "s1", workoutId: "done", exerciseId: null, exerciseName: "Fictional lift", setIndex: 1, reps: "8", load: "30", unit: "kg", completed: true },
      { id: "s2", workoutId: "done", exerciseId: null, exerciseName: "Fictional lift", setIndex: 2, reps: "7", load: "30", unit: "kg", completed: true },
      { id: "s3", workoutId: "open", exerciseId: null, exerciseName: "Other lift", setIndex: 1, reps: "10", load: "20", unit: "kg", completed: true },
    ]);
    expect(anchors).toHaveLength(1);
    expect(anchors[0]).toMatchObject({ exerciseName: "Fictional lift", sessionCount: 1 });
    expect(anchors[0].latestSets.map(set => set.reps)).toEqual([8, 7]);
  });
});
