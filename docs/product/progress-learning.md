# Coach progress and learning

Status: Current

## Purpose

Define how Coach turns completed training, metrics and athlete feedback into understandable progress, persistent coaching judgement and better subsequent planning.

## Core promise

Coach should be able to answer two questions from durable product state without asking the athlete to reconstruct history:

1. How am I doing?
2. What should change next?

## Facts and interpretation

Coach must keep deterministic product facts distinct from interpretative coaching judgement.

Code should own reliable facts and comparisons such as:

- planned versus actual sessions;
- exercise/set progression;
- running and cycling duration/volume/performance evidence;
- metric trends;
- goal dates and measured indicators;
- session completion/adaptation states.

The GPT interprets those facts into coaching judgement. Interpretations must be explicitly labelled and revisable rather than treated as immutable athlete truth.

## Progress experience

The Progress surface should answer `How am I doing?` before presenting detailed analytics.

A useful hierarchy is:

1. concise current Coach assessment;
2. active goals with trajectory/assessment;
3. only the performance and metric trends relevant to those goals;
4. recent plan-versus-actual training;
5. useful exercise/session history and meaningful records.

Do not display every measurement merely because the system stores it.

## Goal assessment

Goals may be quantitative or qualitative. A deliberately modest assessment vocabulary is sufficient for MVP:

- Progressing well;
- Progressing;
- Unclear / insufficient evidence;
- Stalled;
- Needs review.

For dated measurable goals Coach may additionally state whether a target currently appears realistic, but must not invent pseudo-precise probabilities.

Physique goals may use training progression, optional measurements and the athlete's own qualitative assessment. Progress photos are not required for MVP.

Health/fitness goals may be interpreted through relevant training and fitness evidence, but Coach must not convert them into unsupported medical claims.

## Exercise and performance history

Stable exercise identity and durable actuals should make questions such as `What did I bench last time?` directly answerable from trusted data.

The app should expose useful chronological history for strength exercises and meaningful running/cycling benchmarks without creating an elaborate gamified achievement system.

Obvious records may be calculated deterministically. Coach may recognise meaningful milestones conversationally.

## Weekly factual review

Before the next week's planning conversation, the harness should be able to generate a compact factual review of the previous period containing, as relevant:

- sessions planned;
- sessions completed as planned;
- adapted, partial, deliberately skipped and missed sessions;
- strength progression or regression evidence;
- running/cycling completion and relevant performance evidence;
- selected metric changes;
- important athlete feedback;
- active goal/event context.

The athlete should not need to recreate this summary manually.

## Coach review

Coach may create a small dated interpretative review based on the factual period summary.

Conceptually:

```text
CoachReview
  athlete
  period_start / period_end
  concise summary
  goal assessments
  recommended direction
  evidence references
  created_at
```

A review records the coaching conclusion, not hidden chain-of-thought. It should preserve enough evidence linkage to explain later decisions.

Example:

> Strength progressed, but easy aerobic work fell below plan. Keep gym progression and restore easy running before increasing running intensity.

This lets future Coach understand why a previous programming choice was made instead of rediscovering every decision from scratch.

## Coaching observations

Coach may store bounded athlete-specific observations such as a repeated treadmill/road difference or a training format that appears to support adherence.

MVP observations should be simple, evidence-linked and editable/retirable. Do not implement a complex automated confidence-state machine.

An observation is not a fact merely because Coach wrote it.

## Next-week bridge

The closed coaching loop is:

```text
locked plan
    ↓
actual training
    ↓
athlete feedback + metrics
    ↓
factual weekly summary
    ↓
Coach review / goal assessment
    ↓
new availability and temporary context
    ↓
next weekly plan
```

The next planning-context read should include the previous factual summary and current Coach review so the GPT can make a grounded progression decision.

## Exclusions

The MVP does not require:

- readiness/recovery scores;
- training-load algorithms presented as authoritative coaching scores;
- photo analysis;
- complex achievement/PR systems;
- punitive streak mechanics;
- medical risk scoring;
- hidden model reasoning stored as athlete memory.

## MVP success test

The product model succeeds when repeated real use makes Coach visibly better at planning and explaining the next week because it remembers what was intended, what actually happened, how the athlete responded and why previous coaching decisions were made.