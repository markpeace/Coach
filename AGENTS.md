# Coach agent instructions

Status: Current

## Product boundary

This repository is for **Coach**, a multi-athlete AI personal trainer. Do not import assumptions, data models or roadmap scope from Alfred, Carme or any other product unless the product owner explicitly approves reuse.

## Required reading

Before implementation work, read in this order:

1. `README.md`
2. `docs/SSOT.md`
3. `docs/product/mvp-approved-scope.md`
4. the relevant current product/architecture contract
5. active Linear project/milestone/issues
6. only the code/tests relevant to the approved task

## Source-of-truth rule

Current direct product-owner instruction has highest authority.

Linear now controls active delivery and roadmap state for Coach. GitHub holds durable product/technical memory and implementation evidence; it must not become a second backlog.

## Product principles

- Coach is multi-athlete. Athlete state must remain deliberately and explicitly scoped.
- A shared Custom GPT must establish the active athlete before athlete-specific reads/writes when identity is ambiguous.
- Conversational athlete selection is a trusted-household state-selection mechanism, not cryptographic proof of which human typed the message.
- Each athlete may configure and name their Coach persona. Persona must not alter identity/data-security boundaries or core coaching safeguards.
- The GPT supplies semantic interpretation, conversational reasoning and coaching judgement.
- Product code owns durable trusted state, athlete scope, dates, goals, plans, exercise prescriptions, actuals, metrics, locations/equipment, validation, provenance and persistence.
- The GPT and app must not maintain competing memories. Both operate over the same durable athlete ledger/service layer.
- A locked plan is an agreed baseline that may later be adapted; preserve the accepted baseline, current effective prescription and actual performance distinctly.
- Athlete feedback, factual adaptations and Coach interpretation are different state types.
- Coaching observations/hypotheses must be distinguished from established athlete facts and remain evidence-linked/retirable.
- Athlete-provided screenshots/supported workout files may be semantically interpreted by the GPT when the ChatGPT surface can inspect them. The backend validates/stores structured results and must not silently become a parallel semantic workout-evidence parser.
- Future imported activity data is evidence and should reconcile into Coach's source-neutral ledger rather than becoming canonical programme memory.

## Privacy and data

Never commit real athlete health/fitness data, credentials, access secrets, OAuth tokens, HealthKit payloads, activity routes or other personal data to Git.

Runtime APIs and logs should retain only data necessary for the product and avoid unnecessary narrative or sensitive detail.

Do not allow accidental cross-athlete state leakage through URL parameters, client state, API joins, conversational selection or imported-data routing.

The repository is currently public. Treat that as an additional reason to keep all runtime secrets/personal data outside Git, not as a deployment security mechanism.

## MVP execution discipline

The current lifecycle is **approved MVP implementation**.

Active Linear project: **First MVP: Persistent personal coach**.

Approved autonomous implementation scope: **CCH-1 through CCH-26**.

CCH-27 and CCH-28 are owner-led validation/reconciliation and must not be executed as part of the autonomous build handoff.

Do not implement future possibilities merely because they appear in `docs/product/future-possibilities.md`.

In particular, automatic Apple Health/Health Auto Export, Strava, native iOS/watchOS, WorkoutKit, GPS/live sensors, calendar integration and Bluetooth/FTMS trainer control are outside this MVP.

## Technical direction

Follow `docs/architecture/mvp-technical-contract.md`.

The broad architecture is Custom GPT + bounded versioned Action API + responsive Vercel-hosted application + dedicated durable PostgreSQL state.

Do not add backend LLM calls by default. Use the Custom GPT for coaching intelligence unless a later approved decision establishes a concrete need for another model service.

Prefer task-oriented Action operations over unrestricted generic CRUD.

## Verification and deployment

Development is local/CI first. A repository change does not automatically justify a remote build or deployment.

Before deployment-sensitive implementation, establish the actual Vercel Git integration, production branch, Preview behaviour, ignored-build rules and manual deployment path. Do not assume Coach shares Alfred or Carme deployment settings.

The current MVP approval permits creation/configuration of dedicated Coach Neon and Vercel **Preview** resources needed to complete CCH-1–26. It does not permit production deployment/promotion.

Prefer one coherent test-ready Preview near handback. Avoid duplicate automatic/manual deployments and push-fix-push loops that local verification could prevent.

## Autonomous Work behaviour

Inside the approved CCH-1–26 envelope, resolve normal implementation details without returning to the product owner for preferences already decided in current sources.

If a user-only platform action is genuinely unavoidable, complete all other possible work first and surface it only when it is the sole remaining blocker to test readiness.

The CCH-26 handback must include the Product Operations Board completion contract: implementation map, checks actually run, relevant deployment evidence, known limitations, regression-risk map, standalone owner-testing checklist and exact Linear reconciliation recommendation.

## Documentation

Persist only landed product decisions, durable technical/deployment contracts and information future work would otherwise need to rediscover.

Implementation issues and live scope belong in Linear. Do not mirror the backlog in GitHub.