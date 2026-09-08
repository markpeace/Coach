# Coach agent instructions

Status: Current

## Product boundary

This repository is for **Coach**, a multi-athlete AI personal trainer. Do not import assumptions, data models or roadmap scope from Alfred, Carme or any other product unless the product owner explicitly approves reuse.

## Required reading

Before product or implementation work, read in this order:

1. `README.md`
2. `docs/SSOT.md`
3. the relevant current product/architecture document
4. active Linear context once the Coach Linear team exists
5. only the code/tests relevant to the approved task

## Source-of-truth rule

Current direct product-owner instruction has highest authority.

Before Linear exists, GitHub holds durable product memory but must not become a hidden backlog. Once Linear is created, Linear controls active delivery and roadmap state; GitHub continues to hold durable product/technical memory and implementation evidence.

## Product principles

- Coach is multi-athlete. Athlete identity boundaries are hard product boundaries.
- A shared Custom GPT must establish the active athlete before reading or writing athlete-specific state when identity is ambiguous.
- Each athlete may configure and name their coach persona. Persona must not alter identity, data-security or core coaching safeguards.
- The GPT supplies conversational interpretation and coaching judgement.
- Product code owns trusted identity, facts, dates, goals, plans, exercise prescriptions, actuals, metrics, locations/equipment, validation, provenance and persistence.
- The GPT and app must not maintain competing memories. Both operate over the same durable athlete ledger.
- A locked plan is an agreed baseline that can later be adapted; preserve planned-versus-actual history rather than overwriting it.
- Coaching observations/hypotheses must be distinguished from established athlete facts.
- Imported activity data is evidence. It should reconcile into Coach's source-neutral training ledger rather than becoming the product's canonical programme state.

## Privacy and data

Never commit real athlete health/fitness data, credentials, OAuth tokens, HealthKit payloads, activity routes or other personal data to Git.

Runtime APIs and logs should retain only data necessary for the product and avoid unnecessary narrative or sensitive detail.

Do not allow one athlete to read or mutate another athlete's state through conversational identity, URL parameters, client state or imported-data routing.

## MVP discipline

The current lifecycle is MVP design. Do not implement future possibilities merely because they appear in `docs/product/future-possibilities.md`.

In particular, native iOS/watchOS, Apple Health ingestion, Strava connectivity and Bluetooth/FTMS trainer control are not automatically authorised MVP scope.

## Technical direction

The intended broad architecture is Custom GPT + bounded versioned Action API + responsive Vercel-hosted application + durable PostgreSQL state.

Do not add backend LLM calls by default. Use the Custom GPT for coaching intelligence unless a future approved decision establishes a concrete need for another model service.

Prefer task-oriented Action operations over unrestricted generic CRUD.

## Verification and deployment

Development should be local/CI first. A repository change does not automatically justify a remote build or deployment.

Before deployment-sensitive implementation, establish the actual Vercel Git integration, production branch, Preview behaviour, ignored-build rules and manual deployment path. Do not assume Coach shares Alfred or Carme deployment settings.

Do not deploy or promote production without explicit product-owner authority.

## Documentation

Persist only landed product decisions, durable technical contracts and information future work would otherwise need to rediscover.

Exploration remains in conversation until it has genuinely landed. Mark speculative material as Planning or Draft.
