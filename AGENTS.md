# Coach agent instructions

Status: Current

## Product boundary

This repository is for **Coach**, a multi-athlete AI personal trainer. Do not import assumptions, data models or roadmap scope from Alfred, Carme or any other product unless the product owner explicitly approves reuse.

## Required reading

Before implementation work, read in this order:

1. `README.md`
2. `docs/SSOT.md`
3. active Linear project/milestone/issues
4. the relevant current product/architecture contract
5. only the code/tests relevant to the approved task

For conversational behaviour, also read `skills/coach/SKILL.md` when the task touches onboarding, planning, workout interaction, progress/review or decision tracing.

## Source-of-truth rule

Current direct product-owner instruction has highest authority.

Linear controls active delivery and roadmap state for Coach. GitHub holds durable product/technical memory and implementation evidence; it must not become a second backlog.

## Product principles

- Coach is multi-athlete. Athlete state must remain deliberately and explicitly scoped.
- A conversational Coach must establish the active athlete before athlete-specific reads/writes when identity is ambiguous.
- Conversational athlete selection is a trusted-household state-selection mechanism, not cryptographic proof of which human typed the message.
- Each athlete may configure and name their Coach persona. Persona must not alter identity/data-security boundaries or core coaching safeguards.
- The model supplies semantic interpretation, conversational reasoning and coaching judgement.
- Product code owns durable trusted state, athlete scope, dates, goals, plans, exercise prescriptions, actuals, metrics, locations/equipment, validation, provenance and persistence.
- The skill and app must not maintain competing memories. Both operate over the same durable athlete ledger/service layer.
- A locked plan is an agreed baseline that may later be adapted; preserve the accepted baseline, current effective prescription and actual performance distinctly.
- Athlete feedback, factual adaptations and Coach interpretation are different state types.
- Coaching observations/hypotheses must be distinguished from established athlete facts and remain evidence-linked/retirable.
- Athlete-provided screenshots/supported workout files may be semantically interpreted by the host conversation when it can inspect them. The backend validates/stores structured results and must not silently become a parallel semantic workout-evidence parser.
- Future imported activity data is evidence and should reconcile into Coach's source-neutral ledger rather than becoming canonical programme memory.
- Do not persist hidden chain-of-thought. MVP v2 uses concise structured decision traces for inspectable coaching rationale.

## Privacy and live data

Never commit real athlete health/fitness data, credentials, access secrets, OAuth tokens, HealthKit payloads, activity routes, diagnostic exports or other personal data to Git.

Runtime APIs and logs should retain only data necessary for the product and avoid unnecessary narrative or sensitive detail.

Do not allow accidental cross-athlete state leakage through URL parameters, client state, API joins, conversational selection, imports or exports.

Coach now contains real athlete data in the dedicated Neon ledger. Treat that state as production-like even while the deployment remains Preview:

- no reset/reseed, TRUNCATE, DROP-and-recreate or synthetic fixture shortcuts on the live branch;
- prefer additive/backward-compatible schema evolution;
- create a named manual Neon snapshot immediately before any state-affecting migration;
- verify athlete continuity and relational invariants after migrations;
- use temporary Neon branches or PGlite for destructive/testing experiments.

## Current delivery discipline

Current lifecycle: **MVP v2 active with ongoing real-athlete validation**.

Active Linear project: **MVP v2: Observable, evidence-rich coaching**.

The original project **First MVP: Persistent personal coach** remains the validation evidence stream through CCH-27/CCH-28. Real-use evidence can still reorder or narrow v2.

Current v2 sequencing is controlled by Linear. Do not implement future possibilities merely because they appear in `docs/product/future-possibilities.md`.

## Conversational architecture

The supported direction is:

```text
Coach Agent Skill
  behavioural workflow and coaching operating model
        ↓
Private ChatGPT MCP app
  bounded reads/writes
        ↓
shared Coach domain/service layer
        ↓
durable PostgreSQL athlete ledger
```

The skill guides behaviour; MCP tool descriptions define operation semantics; the domain/server layer enforces athlete isolation, validation, versions, idempotency and durable-state invariants.

The legacy `gpt/` package is migration/history material, not the active integration surface.

## Verification and deployment

Development is local/CI first. A repository change does not automatically justify a remote build or deployment.

Before deployment-sensitive implementation, establish the actual Vercel Git integration, production branch, Preview behaviour, ignored-build rules and manual deployment path. Do not assume Coach shares Alfred or Carme deployment settings.

Preview remains the authorised remote target unless a separate production release is explicitly approved. Prefer one coherent test-ready Preview per meaningful batch. Avoid duplicate automatic/manual deployments and push-fix-push loops that local/static verification could prevent.

For database changes, follow the live-data preservation contract in CCH-31 before applying any migration to the live Coach branch.

## Documentation

Persist only landed product decisions, durable technical/deployment contracts and information future work would otherwise need to rediscover.

Implementation issues and live scope belong in Linear. Do not mirror the backlog in GitHub.