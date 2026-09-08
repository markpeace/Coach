# Coach

Coach is a multi-athlete AI personal trainer: a Custom GPT coaching and conversation layer backed by a Vercel-hosted application and durable athlete training state.

Each athlete has a distinct identity, goals, training priorities, metrics, locations/equipment, plans, history and configurable coach persona. The shared product name is **Coach**; individual athletes may name their trainer, for example **Coach Amy** or **Coach Ryan**.

## Current position

Lifecycle: **Discovery moving into MVP design**.

The core product loop is:

```text
goals + availability + recent evidence
        ↓
conversational weekly plan
        ↓
review / tweak / lock
        ↓
day-by-day execution
        ↓
actual performance + qualitative feedback
        ↓
progress interpretation
        ↓
next coaching decision
```

The MVP is intended to test whether a persistent AI trainer can make personalised training planning and progression materially better than using an ordinary ChatGPT conversation without a durable training harness.

## Source of truth

Until a dedicated Linear team is created:

1. current direct product-owner instruction is authoritative;
2. `docs/SSOT.md` routes durable repository memory;
3. current product and architecture docs define landed decisions;
4. future-possibility documents are explicitly non-MVP planning context.

Once Linear is established, Linear will become the delivery and roadmap source of truth. GitHub will remain durable product/technical memory and implementation evidence.

## Start here

- [`AGENTS.md`](AGENTS.md)
- [`docs/SSOT.md`](docs/SSOT.md)
- [`docs/product/product-definition.md`](docs/product/product-definition.md)
- [`docs/product/mvp-definition.md`](docs/product/mvp-definition.md)
- [`docs/product/future-possibilities.md`](docs/product/future-possibilities.md)
- [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md)

## Architecture direction

Coach follows the same broad product pattern as Alfred and Carme:

```text
Athlete
  |
  +--> Custom GPT
  |      conversation, interpretation, coaching judgement
  |             |
  |             +--> bounded versioned Actions
  |
  +--> responsive web application
         planning, workout execution, progress inspection, direct edits
                 |
                 +--> shared domain/service layer
                          |
                          +--> durable PostgreSQL athlete ledger
```

The governing principle is **LLM-reasoned and code-grounded**. The GPT supplies coaching judgement; code owns trusted identity, facts, plans, actuals, metrics, validation, provenance and durable state.

## Repository safety

Do not commit athlete health/fitness data, OAuth tokens, API secrets, HealthKit exports or other personal data to this repository. Runtime athlete data belongs in the application data layer, not Git history.
