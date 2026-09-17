import { planPayloadSchema } from "./contracts";

type JsonRecord = Record<string, unknown>;
type ProgressPlan = { id: string; weekStart: string; status: string; currentPayload: unknown };
type ProgressWorkout = {
  id: string;
  planId: string;
  sessionKey: string;
  modality: string;
  status: string;
  actual: JsonRecord | null;
  feedback: JsonRecord | null;
  completedAt: Date | string | null;
};
type MetricDefinition = { id: string; key: string; displayName: string; unit: string };
type MetricReading = {
  id: string;
  definitionId: string;
  measuredAt: Date | string;
  value: string | number;
  source: string;
  context: string | null;
  confidence: string | null;
};
type SetActual = {
  id: string;
  workoutId: string;
  exerciseId: string | null;
  exerciseName: string;
  setIndex: number;
  reps: string | number | null;
  load: string | number | null;
  unit: string | null;
  completed: boolean;
};

function iso(value: Date | string | null) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}
function keyFor(planId: string, sessionKey: string) { return `${planId}:${sessionKey}`; }
function exerciseKey(row: SetActual) {
  return row.exerciseId ? `id:${row.exerciseId}` : `name:${row.exerciseName.trim().toLocaleLowerCase()}`;
}

export function buildPlanReality(plans: ProgressPlan[], workouts: ProgressWorkout[], periodStart?: string, periodEnd?: string) {
  const bySession = new Map(workouts.map(workout => [keyFor(workout.planId, workout.sessionKey), workout]));
  return plans.filter(plan => plan.status === "locked").flatMap(plan => {
    const payload = planPayloadSchema.parse(plan.currentPayload);
    return payload.sessions.filter(session => (!periodStart || session.date >= periodStart) && (!periodEnd || session.date <= periodEnd)).map(session => {
      const workout = bySession.get(keyFor(plan.id, session.key));
      return {
        planId: plan.id,
        weekStart: plan.weekStart,
        planStatus: plan.status,
        sessionKey: session.key,
        date: session.date,
        title: session.title,
        modality: session.modality,
        intendedStimulus: session.intendedStimulus,
        plannedDurationMinutes: session.durationMinutes ?? null,
        status: workout?.status ?? "planned",
        workout: workout ? {
          id: workout.id,
          status: workout.status,
          actual: workout.actual,
          feedback: workout.feedback,
          completedAt: iso(workout.completedAt),
        } : null,
      };
    });
  }).sort((a, b) => a.date.localeCompare(b.date) || a.sessionKey.localeCompare(b.sessionKey));
}

export function summarisePlanReality(sessions: ReturnType<typeof buildPlanReality>) {
  const counts = { planned: sessions.length, completed: 0, partial: 0, skipped: 0, missed: 0, inProgress: 0 };
  for (const session of sessions) {
    if (session.status === "completed") counts.completed++;
    else if (session.status === "partial") counts.partial++;
    else if (session.status === "skipped") counts.skipped++;
    else if (session.status === "missed") counts.missed++;
    else if (session.status === "in_progress") counts.inProgress++;
  }
  return counts;
}

export function buildMetricSeries(definitions: MetricDefinition[], readings: MetricReading[]) {
  return definitions.map(definition => ({
    definitionId: definition.id,
    key: definition.key,
    displayName: definition.displayName,
    unit: definition.unit,
    readings: readings
      .filter(reading => reading.definitionId === definition.id)
      .sort((a, b) => new Date(a.measuredAt).getTime() - new Date(b.measuredAt).getTime())
      .map(reading => ({
        id: reading.id,
        measuredAt: iso(reading.measuredAt),
        value: Number(reading.value),
        source: reading.source,
        context: reading.context,
        confidence: reading.confidence,
      })),
  }));
}

export function buildStrengthAnchors(workouts: ProgressWorkout[], sets: SetActual[]) {
  const completed = new Map(
    workouts
      .filter(workout => workout.modality === "strength" && workout.status === "completed")
      .map(workout => [workout.id, workout]),
  );
  const groups = new Map<string, { key: string; exerciseName: string; sessions: Map<string, { workoutId: string; completedAt: string | null; sets: SetActual[] }> }>();
  for (const set of sets) {
    const workout = completed.get(set.workoutId);
    if (!workout || !set.completed) continue;
    const key = exerciseKey(set);
    let group = groups.get(key);
    if (!group) {
      group = { key, exerciseName: set.exerciseName, sessions: new Map() };
      groups.set(key, group);
    }
    let session = group.sessions.get(workout.id);
    if (!session) {
      session = { workoutId: workout.id, completedAt: iso(workout.completedAt), sets: [] };
      group.sessions.set(workout.id, session);
    }
    session.sets.push(set);
  }
  return Array.from(groups.values()).map(group => {
    const sessions = Array.from(group.sessions.values())
      .map(session => ({
        ...session,
        sets: [...session.sets].sort((a, b) => a.setIndex - b.setIndex).map(set => ({
          id: set.id,
          setIndex: set.setIndex,
          reps: set.reps === null ? null : Number(set.reps),
          load: set.load === null ? null : Number(set.load),
          unit: set.unit,
        })),
      }))
      .sort((a, b) => String(a.completedAt ?? "").localeCompare(String(b.completedAt ?? "")));
    const latest = sessions.at(-1);
    return {
      key: group.key,
      exerciseName: group.exerciseName,
      sessionCount: sessions.length,
      latestCompletedAt: latest?.completedAt ?? null,
      latestSets: latest?.sets ?? [],
      sessions,
    };
  }).sort((a, b) => String(b.latestCompletedAt ?? "").localeCompare(String(a.latestCompletedAt ?? "")) || a.exerciseName.localeCompare(b.exerciseName));
}
