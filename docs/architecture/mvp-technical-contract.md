# Coach MVP technical contract

Status: Current for MVP execution

## Purpose

Resolve the implementation choices that would otherwise force an autonomous Work thread to make product-significant decisions while coding.

This document defines the technical execution envelope for the first test-ready Coach MVP. It may be refined for implementation detail where necessary, but its product and trust boundaries must not be silently changed.

## Target state

Deliver a mobile-first private Coach web application plus a reproducible Custom GPT Action package, backed by a dedicated Neon/PostgreSQL database, with one coherent end-to-end loop:

```text
select athlete
→ maintain athlete context
→ provide weekly availability/context
→ generate/revise/lock a week conversationally
→ inspect Today/Plan in app
→ execute/log workouts
→ capture feedback/metrics
→ inspect progress
→ review previous week
→ plan the next week from accumulated evidence
```

## Technical foundation

Use:

- Next.js App Router + TypeScript;
- responsive mobile-first React UI, PWA-friendly but no native wrapper requirement;
- Vercel-hosted web/API surface;
- dedicated Neon PostgreSQL database for Coach;
- Drizzle ORM/migrations or an equivalently typed migration approach if a concrete implementation constraint requires it;
- Zod or equivalent shared runtime validation;
- Vitest/unit/integration tests plus Playwright for critical browser journeys;
- repository-controlled Custom GPT instructions, generated/versioned OpenAPI Action schema and acceptance scenarios.

No backend model API is required. The Custom GPT is the coaching intelligence layer.

## Private MVP access model

The MVP is a trusted small-household product, not a commercial identity platform.

### Web app

Protect the deployed app behind a simple private household access boundary using a server-side secret/passphrase and signed secure session cookie, or an equivalently low-friction private-access mechanism that does not require external OAuth setup.

Requirements:

- no secrets in the repository;
- secure/httpOnly cookie where applicable;
- login/access rate limiting or proportionate abuse protection;
- athlete switching inside the authenticated household is deliberate;
- do not claim that household access proves which individual is holding the device.

### Custom GPT Actions

Use a separate service credential/API key for Action calls. Never reuse the household web passphrase.

Every athlete-specific Action must also require explicit athlete scope. Conversational selection such as `It's Mark` establishes the active athlete for the conversation, but is not cryptographic authentication of that human.

The private MVP trust model is deliberate athlete-state separation inside a trusted household, not secrecy between household athletes.

## Athlete/domain foundation

Implement the landed product contracts in:

- `docs/product/athlete-foundation.md`;
- `docs/product/weekly-planning.md`;
- `docs/product/workout-execution.md`;
- `docs/product/progress-learning.md`.

The exact SQL decomposition may vary, but the durable model must support:

- athletes;
- Coach persona;
- training priorities;
- lightweight training preferences;
- mixed qualitative/quantitative goals;
- dated events and goal links;
- locations and equipment;
- extensible metric definitions/readings with provenance;
- weekly availability, anchors and time-bounded planning context;
- versioned weekly plans and sessions;
- modality-aware prescriptions;
- stable exercise identity/history;
- effective/adapted prescription distinct from original locked prescription;
- strength set actuals and run/cycle session actuals;
- athlete feedback distinct from factual adaptations;
- Coach reviews/goal assessments;
- simple evidence-linked coaching observations.

## Critical invariants

1. Athlete-specific reads/writes are explicitly athlete-scoped.
2. GPT Actions never infer athlete scope from narrative content alone.
3. A locked plan's accepted baseline is never destroyed by later adaptation.
4. Original prescription, effective/adapted prescription and actual performance remain distinguishable.
5. Qualitative feedback, factual events and Coach interpretation are separately represented.
6. Imported/source data fields include provenance from the start even though automatic ingestion is excluded from MVP.
7. The app and GPT operate through the same trusted service/domain layer and cannot maintain competing memories.
8. Writes are validated and idempotent where retries are plausible.
9. Hidden model reasoning is never persisted.
10. Cross-athlete leakage must be tested explicitly.

## App information architecture

Implement four primary athlete-facing surfaces:

### Today

Answer `What am I doing today?` immediately. Show today's planned/effective session, status, important Coach cue and start/resume action.

### Plan

Show a clear week view with draft/locked status, day/session cards, location/duration and visible adaptations. Full prescription opens beneath the session.

### Progress

Lead with concise Coach assessment, then active goals, relevant trends/history and recent plan-versus-actual evidence. Do not create a generic analytics warehouse.

### Athlete

Show who Coach understands the athlete to be: Coach persona, priorities, goals/events, training preferences, locations/equipment and tracked metrics, with editing/history beneath.

Workout execution may use a dedicated route/view launched from Today/Plan rather than becoming a fifth top-level navigation item.

## Weekly planning behaviour

Provide bounded service/API operations sufficient for the GPT to:

- establish/list/select an athlete;
- read a compact planning context;
- record/revise availability and temporary planning context;
- create a structured draft week;
- revise the current draft;
- explicitly lock/accept it;
- read the effective current week;
- propose/write accepted adaptations without erasing the locked baseline.

Availability is opportunity, not a required training quota. The GPT owns programming judgement.

Do not implement a deterministic auto-progression engine or mandatory formal training-block object in MVP.

## Workout execution behaviour

### Strength

Support stable exercises, prescribed sets/reps/load/rest, previous relevant performance/progression cue, fast set-level actual logging and a simple optional rest timer.

### Running

Show structured duration/distance/intensity/interval guidance. In MVP, record actuals manually or conversationally. Do not build GPS/live heart-rate tracking.

### Cycling

Support named Zwift workouts or structured duration/intensity/power guidance. Actuals are manual/conversational in MVP. Do not control trainers.

### Adaptation

Support accepted substitution/load/session changes while preserving original prescription and effective prescription separately.

### Feedback

At completion support lightweight structured difficulty plus optional note. Conversational feedback can attach richer evidence to the same session.

## Progress and learning

Provide deterministic aggregation for relevant history/trends and a bounded progress-context read for the GPT.

Support dated Coach reviews containing only concise conclusions, goal assessments, recommended direction and evidence references, not chain-of-thought.

The next planning-context read must be able to include the previous factual summary and current Coach review.

## API/Action philosophy

Expose bounded task-oriented `/api/v1/...` operations rather than generic unrestricted CRUD.

Likely capabilities include:

- athlete selection/read;
- athlete foundation reads/writes;
- planning context;
- availability/context writes;
- draft/revise/lock/adapt weekly plan;
- Today/session read;
- start/update/complete workout;
- set/session actual recording;
- feedback attachment;
- metric recording;
- progress context;
- Coach review/observation recording.

Final endpoint names are implementation detail. Action/OpenAPI schemas should be generated from or verified against the same validation contracts used by the application.

## Custom GPT package

The repository must contain a reproducible versioned package including:

- Coach system/instruction text;
- Action OpenAPI schema;
- authentication configuration notes that do not contain secrets;
- athlete-selection behaviour;
- tool-use rules and write confirmation rules;
- acceptance scenarios covering weekly planning, workout logging, progress review, athlete switching and failure cases;
- manifest/version/checksum or equivalent reproducibility metadata;
- rollback instructions to the previous package version once versions exist.

If automated Custom GPT configuration is possible in the execution environment, configure it. If a platform-only human action is unavoidable, complete everything else first and return only when that is the sole remaining blocker, with exact minimal steps.

## Data and privacy

Do not commit real athlete data, access secrets or health/fitness narratives to GitHub.

Preview/test data should be created through the application/database and kept athlete-scoped. Synthetic fixtures may live in tests but must be obviously fictional.

Diagnostics must avoid unnecessary health detail and secrets.

## Deployment contract

Before the first remote deployment, inspect and document actual Vercel topology.

For this new product prefer one authoritative, economical development path:

1. implement and verify locally;
2. avoid remote pushes/deployments used only for intermediate compilation checks;
3. provision/configure Vercel and Neon only when needed for integrated verification;
4. create one coherent test-ready Preview near the end of the batch, with additional remote deployments only when genuinely required by environment-specific failures;
5. do not deploy/promote to production.

The current owner approval covers creating/configuring the dedicated Coach Neon/Vercel Preview resources required for this MVP execution envelope. It does not authorise a public production release.

Record the actual deployment topology and material deployment evidence in durable docs/Linear when established.

## Explicit MVP exclusions

Do not add unless required to fix the agreed MVP itself:

- Apple Health / Health Auto Export integration;
- Strava integration;
- native iPhone/watchOS app;
- WorkoutKit;
- live sensor capture;
- Web Bluetooth / FTMS control;
- GPS/route tracking;
- calendar integration;
- nutrition tracking;
- social/community features;
- public signup/subscription/billing;
- complex recovery/load scores;
- medical diagnosis/risk scoring;
- progress-photo analysis;
- sophisticated gamification.

## Verification contract

Before owner handback, run and report as applicable:

- lint/static analysis;
- typecheck;
- unit/domain tests;
- database migration/schema verification;
- API integration tests;
- explicit cross-athlete isolation tests;
- plan version/locked-baseline tests;
- workout prescription/effective/actual distinction tests;
- idempotency/retry tests for important writes;
- browser E2E for athlete setup, weekly planning state visibility, workout logging and progress;
- local production build;
- remote Preview smoke/integration checks if deployed.

The final Work handback must provide the Product Operations Board completion contract: implementation map, checks actually run, deployment evidence where needed, known limitations, regression-risk map, detailed product-owner testing checklist and exact Linear reconciliation/closure recommendation.

## Autonomous-execution rule

Within this contract and the approved Linear MVP implementation milestones, Work should resolve normal implementation details itself and should not return to the product owner for preferences already decided here.

If an unavoidable user-only platform action is required, continue all other possible work and surface it only when it is the sole remaining blocker to a test-ready MVP.