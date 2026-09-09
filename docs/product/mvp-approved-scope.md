# Coach MVP approved scope

Status: Current

## Purpose

This document marks the Coach MVP product design as sufficiently resolved for autonomous implementation through a test-ready candidate.

The earlier `mvp-definition.md` remains useful design history/detail, but implementation authority is the combination of this approval, the four landed product contracts, the MVP technical contract, the active Linear project and current product-owner instruction.

## MVP learning question

Does a durable athlete ledger plus conversational weekly planning, workout execution and progress review make Coach useful enough that athletes choose it as an ongoing personal trainer rather than repeatedly reconstructing context in ordinary ChatGPT conversations?

## Approved core loop

```text
select athlete
→ maintain athlete/Coach context
→ provide real weekly availability and temporary context
→ Coach drafts/revises/locks a coherent week
→ athlete inspects Today/Plan
→ athlete executes/logs workouts
→ athlete reports feedback/metrics/evidence
→ Coach/app show grounded progress
→ Coach reviews previous period
→ next week is planned from accumulated evidence
```

## Landed product contracts

Implementation must satisfy:

- `athlete-foundation.md`: multi-athlete state, Coach persona, priorities, mixed qualitative/quantitative goals, events, locations/equipment and metrics;
- `weekly-planning.md`: availability, anchors, temporary context, planning context, draft/lock/adaptation and session intent;
- `workout-execution.md`: prescription/effective/actual distinction, strength execution, run/cycle actuals, lightweight feedback and GPT-side interpretation of athlete-provided workout evidence;
- `progress-learning.md`: factual progress aggregation, Coach reviews/goal assessments, evidence-linked observations and next-week learning bridge.

## Athlete-provided evidence

Ad hoc screenshots and supported uploaded workout files inside the Custom GPT conversation are included in MVP when the ChatGPT surface can inspect them reliably.

Semantic extraction and coaching interpretation happen in the GPT. The backend validates and stores structured facts/provenance/concise interpretation; it does not become a second semantic screenshot/workout-file parser.

If evidence cannot be inspected reliably, Coach must omit unsupported values or request another representation rather than fabricate.

## MVP experience

The web app has four primary athlete-facing surfaces:

- Today;
- Plan;
- Progress;
- Athlete.

Workout execution launches from Today/Plan and may use its own route/view without becoming another top-level product area.

## Approved implementation restraint

The MVP intentionally does not include automatic Apple Health/Health Auto Export ingestion, Strava, GPS/live sensor tracking, native iPhone/watchOS, WorkoutKit, Web Bluetooth/FTMS, calendar integration, nutrition, social/community, public signup/billing, medical scoring, progress-photo analysis or complex recovery/gamification systems.

These remain future possibilities unless later product evidence promotes them.

## Technical execution

`docs/architecture/mvp-technical-contract.md` is the current implementation contract. It resolves the private household access model, separate GPT service authentication, dedicated Neon persistence, Vercel Preview/deployment economy, typed bounded API shape, verification requirements and autonomous-execution rules.

## Linear delivery authority

Linear team: **Coach**

Project: **First MVP: Persistent personal coach**

Implementation scope for the autonomous Work handoff is **CCH-1 through CCH-26**, ending when one integrated MVP candidate is ready for product-owner testing.

**CCH-27 and CCH-28 are explicitly outside that autonomous implementation handoff.** They are the owner-led real-athlete validation and subsequent evidence-led reconciliation.

## Approval boundary

Normal implementation decisions inside these contracts are delegated to the executing Work thread. It should not return to the product owner for preferences already decided in the sources.

Creation/configuration of the dedicated Coach Neon database and Vercel Preview resources required for the MVP is approved. Production deployment/promotion is not approved.

If a user-only platform step is genuinely unavoidable, the executor should complete all other work first and surface it only when it is the sole remaining blocker to a test-ready MVP.