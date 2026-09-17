import "server-only";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
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
import { DomainError } from "./invariants";
import { assembleAthleteDiagnosticExport } from "./diagnostic-export-shape";

export async function buildAthleteDiagnosticExport(athleteId: string, generatedAt = new Date()) {
  const [athlete] = await db().select().from(athletes).where(eq(athletes.id, athleteId)).limit(1);
  if (!athlete) throw new DomainError("NOT_FOUND", "Athlete not found");

  const [
    athleteContextRows,
    metricDefinitionRows,
    metricReadingRows,
    weeklyContextRows,
    planRows,
    planVersionRows,
    exerciseRows,
    workoutRows,
    setActualRows,
    reviewRows,
    observationRows,
    decisionTraceRows,
  ] = await Promise.all([
    db().select().from(athleteContext).where(eq(athleteContext.athleteId, athleteId)).orderBy(asc(athleteContext.createdAt)),
    db().select().from(metricDefinitions).where(eq(metricDefinitions.athleteId, athleteId)).orderBy(asc(metricDefinitions.createdAt)),
    db().select().from(metricReadings).where(eq(metricReadings.athleteId, athleteId)).orderBy(asc(metricReadings.measuredAt)),
    db().select().from(weeklyContext).where(eq(weeklyContext.athleteId, athleteId)).orderBy(asc(weeklyContext.effectiveFrom), asc(weeklyContext.createdAt)),
    db().select().from(plans).where(eq(plans.athleteId, athleteId)).orderBy(asc(plans.weekStart), asc(plans.createdAt)),
    db().select().from(planVersions).where(eq(planVersions.athleteId, athleteId)).orderBy(asc(planVersions.createdAt)),
    db().select().from(exercises).where(eq(exercises.athleteId, athleteId)).orderBy(asc(exercises.createdAt)),
    db().select().from(workouts).where(eq(workouts.athleteId, athleteId)).orderBy(asc(workouts.createdAt)),
    db().select().from(setActuals).where(eq(setActuals.athleteId, athleteId)).orderBy(asc(setActuals.createdAt)),
    db().select().from(reviews).where(eq(reviews.athleteId, athleteId)).orderBy(asc(reviews.periodStart), asc(reviews.createdAt)),
    db().select().from(observations).where(eq(observations.athleteId, athleteId)).orderBy(asc(observations.createdAt)),
    db().select().from(decisionTraces).where(eq(decisionTraces.athleteId, athleteId)).orderBy(asc(decisionTraces.occurredAt), asc(decisionTraces.createdAt)),
  ]);

  return assembleAthleteDiagnosticExport({
    athlete,
    athleteContext: athleteContextRows,
    metricDefinitions: metricDefinitionRows,
    metricReadings: metricReadingRows,
    weeklyContext: weeklyContextRows,
    plans: planRows,
    planVersions: planVersionRows,
    exercises: exerciseRows,
    workouts: workoutRows,
    setActuals: setActualRows,
    reviews: reviewRows,
    observations: observationRows,
    decisionTraces: decisionTraceRows,
  }, generatedAt);
}
