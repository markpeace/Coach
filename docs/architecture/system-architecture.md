# Coach system architecture

Status: Current at product-architecture level; implementation details remain subject to MVP design

## Architecture intent

Coach is a multi-athlete product with an LLM-owned reasoning and evidence-understanding surface plus code-grounded durable training state.

```text
Athlete
   |
   +--> Shared/private Custom GPT
   |       conversation
   |       parsing / extraction
   |       interpretation / coaching judgement
   |               |
   |               +--> bounded versioned Coach Action API
   |
   +--> Responsive Coach application
           planning, workout execution, progress, direct edits
                    |
                    +--> shared domain/service layer
                             |
                             +--> durable PostgreSQL athlete ledger
```

The GPT and application must not maintain competing memories. Athlete facts, plans, actuals, metrics and persisted coaching insight live behind the shared application/API boundary.

## Core intelligence principle

**The LLM is the sole semantic reasoning layer for Coach.**

This includes both:

- parsing/extracting meaning from athlete-provided natural language, screenshots and supported uploaded files;
- interpreting training evidence and making coaching judgements.

The backend must not grow a parallel workout-understanding or coaching engine.

The harness exists to provide trusted structured state, bounded reads/writes, validation, identity boundaries, provenance, versioning and persistence.

Code may perform literal deterministic operations where useful for integrity or display, for example unit validation, arithmetic derived values, date comparisons or stable aggregations. These operations must not become semantic interpretation. Code should not decide that a file contains a particular workout structure, infer the intended stimulus, judge whether an athlete progressed, or decide what the programme should do next.

Persist the useful outputs of LLM reasoning, not hidden chain-of-thought. A stored coaching insight may include a concise conclusion, relevant evidence references, confidence/context where useful, and a coaching implication.

## Expected technical foundation

Coach is intended to follow the proven Alfred/Carme family pattern:

- Next.js App Router + TypeScript;
- Vercel-hosted web application and server functions;
- PostgreSQL, likely dedicated Neon boundaries;
- schema/validation tooling such as Drizzle and Zod;
- repository-controlled Custom GPT instructions and generated/versioned OpenAPI Actions;
- local/CI verification before meaningful remote deployment checkpoints.

These are architecture directions rather than permission to copy another product's implementation wholesale. Exact authentication, deployment topology and data schema must be decided for Coach itself.

No backend model API is required by default. The Custom GPT is the intelligence layer unless later evidence demonstrates a concrete need for additional model services.

## Identity model

Coach requires hard multi-athlete boundaries from the first usable version.

Two concepts must remain distinct:

### Product/application authority

The application/API must know which athlete a request is authorised to read or mutate. Athlete selection must be validated server-side and must not rely solely on client presentation or free-form conversation.

### Conversational athlete

The shared GPT needs a bounded way to establish who is currently speaking/being coached. A prompt such as `It's Helen` may select an athlete through an authorised Action, but conversational identity by itself must not grant access to arbitrary athlete state.

The exact MVP authentication model is not yet frozen. Whatever implementation is chosen must make cross-athlete leakage difficult by construction and easy to test.

## GPT responsibilities

The Custom GPT owns semantic understanding and coaching intelligence. It may:

- parse athlete-provided natural language, screenshots and supported uploaded files;
- extract useful structured workout/activity facts from that evidence;
- resolve ambiguity conversationally where evidence is incomplete;
- interpret natural availability and training language;
- reason across goals, priorities, recent history and current plan state;
- propose a weekly programme;
- explain programme rationale;
- adapt a session or week when circumstances change;
- interpret qualitative feedback;
- interpret actual performance, trends and uploaded workout evidence;
- judge progression and useful next steps;
- suggest exercise/session substitutions that preserve intended stimulus;
- decide what concise coaching insight is useful to persist;
- express the configured athlete-specific coach persona.

The GPT must not:

- invent durable athlete facts when API state is unknown;
- bypass athlete identity boundaries;
- claim a durable change occurred without a successful Action result;
- treat one ambiguous extraction or chat comment as automatically establishing a permanent coaching belief;
- persist hidden chain-of-thought or unstructured internal reasoning as athlete state.

## Product-code responsibilities

Code owns trustworthy structure and persistence rather than semantic reasoning. It owns:

- athlete records and authorisation boundaries;
- trainer persona configuration fields;
- training priorities;
- goals and events;
- athlete metrics and provenance;
- locations and equipment;
- weekly availability facts;
- plan lifecycle/versioning;
- session/exercise/set prescriptions;
- workout actuals and completion/adaptation state;
- persisted coaching insights/observations and their evidence references;
- source/provenance for manually entered or LLM-extracted evidence;
- schema and unit validation;
- deterministic literal calculations/comparisons where useful;
- validation, idempotency, privacy and structured errors;
- history needed to distinguish prescription, adaptation and actual performance.

Code must not:

- semantically parse screenshots or workout files;
- infer workout meaning from athlete evidence;
- decide whether a session achieved its intended stimulus;
- make progression or programming decisions;
- create a second hidden coaching model alongside the GPT.

Important domain invariants must not live only in React code or only in GPT instructions.

## Conceptual domain model

The first design should expect relationships broadly like:

```text
Athlete
  ├── CoachPersona
  ├── TrainingPriorities
  ├── Goals
  ├── Events
  ├── Metrics[]
  ├── Locations[]
  │     └── Equipment[]
  ├── Availability[]
  ├── WeeklyPlans[]
  │     └── Sessions[]
  │           └── Prescriptions / Exercises / Sets
  │                 └── Actuals
  ├── Feedback[]
  ├── EvidenceReferences[]
  └── CoachingInsights[]
```

This is conceptual rather than a committed SQL schema. MVP design should simplify where possible while preserving the important distinctions.

## Plan/state model

Plan history is important product evidence.

A weekly plan should support at least:

- draft state;
- explicit athlete acceptance/lock;
- later adaptation without erasing the accepted baseline;
- current effective plan read;
- history sufficient to explain planned-versus-actual outcomes.

Do not use in-place mutation in ways that make it impossible to know what the athlete originally agreed to do.

## Workout execution model

The app should support a shared session lifecycle while allowing modality-specific prescriptions and actuals.

### Strength

Structured exercise/set prescriptions and useful set-level recording.

### Running

Structured session prescription such as duration/distance/intensity/interval guidance, with direct or conversational actual result entry in MVP.

### Cycling

Structured duration/intensity guidance and named Zwift workout support where relevant, with direct or conversational actual result entry in MVP.

Athlete-provided evidence such as screenshots or supported uploaded workout files may also be interpreted by the GPT and written into the same actual/evidence model through bounded Actions.

Future automatic activity ingestion should attach evidence to this same model rather than create a separate parallel activity product.

## Metrics model

Use an extensible time-series metric model with:

- athlete;
- metric type;
- timestamp/date;
- value and unit;
- source/provenance;
- optional confidence/context where useful.

Do not hard-code the database around body weight alone. The same pattern should be able to accommodate body composition, FTP, running benchmarks and future athlete metrics.

## Athlete-provided evidence

Coach should support evidence arriving inside the GPT conversation where the current ChatGPT surface can inspect it.

Examples include:

- screenshots from running, cycling or strength apps;
- workout summaries;
- exported workout files such as `.fit` when the GPT surface can inspect the uploaded file;
- other athlete-provided files/images containing training evidence.

The GPT performs extraction and interpretation. It then sends only the useful structured facts, feedback associations and concise coaching insight to bounded Action endpoints.

The backend validates that the proposed writes conform to the accepted schema, units, athlete scope and state invariants. It does not independently re-parse the source evidence to decide what it means.

Source/provenance should identify that values were extracted from athlete-provided evidence. Raw evidence does not need to become part of the durable Coach ledger unless a later product decision establishes a reason to retain it.

If the GPT cannot reliably inspect a particular uploaded format, it should say so and seek another representation rather than silently invent or delegate semantic parsing to an unplanned backend parser.

## External evidence ingestion

Coach should expose a source-neutral ingestion/service boundary so future evidence can arrive from different authorised sources without changing the coaching model.

Potential future sources include:

- Apple Health export bridge;
- native HealthKit client;
- Coach Apple Watch workouts;
- permitted Strava integration;
- Bluetooth fitness devices;
- other athlete-authorised data providers.

Automatic machine-originated ingestion may create structured factual records directly when the external source already supplies explicit fields. Once those facts enter Coach, interpretation remains an LLM responsibility.

Imported evidence must preserve provenance and map to the correct athlete through authenticated server-side identity, not through a caller-supplied athlete label alone.

Automatic external ingestion is not required for the first MVP.

## App surfaces

The current candidate information architecture is:

### Today

Immediate training focus and start/resume workout action.

### Plan

Weekly plan, draft/locked state, day navigation and visible adaptations.

### Progress

Goal trajectory, selected trends and coach interpretation.

### Athlete

Profile/persona, goals/priorities, locations/equipment and metrics.

These surfaces should be tested against the hero journeys before they become implementation contracts.

## API shape

Use bounded versioned operations, likely under `/api/v1/...`.

Prefer task-oriented contracts such as:

- establish/read active athlete;
- read planning context;
- create/revise/lock a weekly plan;
- read today's session;
- start/update/complete workout;
- record metric;
- record/attach feedback;
- record structured evidence extracted by the GPT;
- record/update concise coaching insight with evidence references;
- read progress context;
- manage locations/equipment/goals.

Do not expose unrestricted generic CRUD to the GPT merely because it is easy to describe in OpenAPI.

The final Action set should be generated or verified against the same schemas used by the application wherever practical.

## Cross-surface consistency

The app and GPT are clients of the same trusted service layer.

A change made through conversation should be visible in the app. A direct app edit should be visible to the GPT on its next bounded read. Conflicting/stale writes should fail predictably rather than silently overwrite important plan/workout state.

## Privacy and observability

Diagnostics should be sufficient to distinguish:

- athlete/auth denial;
- validation failure;
- stale/conflicting write;
- database failure;
- malformed structured write;
- deployment/configuration mismatch.

Do not log credentials, unnecessary athlete narrative, raw hidden model reasoning or more health/fitness detail than is necessary for safe diagnosis.

## Deployment

Vercel is the intended hosting platform, but Coach's actual Git integration and deployment topology have not yet been established.

Before implementation begins, determine:

- whether pushes automatically create Previews;
- which branch is production;
- whether production deploys automatically;
- ignored-build rules;
- manual deployment path;
- how local/synthetic data is isolated from real athlete data.

Do not inherit deployment assumptions from Alfred or Carme without checking the Coach project itself.

## Future native compatibility

Keep the domain/service/API layer independent of the web client so a later iPhone/watchOS application can become another authorised client rather than requiring a new product backend.

This is an architectural compatibility goal, not permission to add native development to MVP scope.
