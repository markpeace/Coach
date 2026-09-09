# Coach

Coach is a multi-athlete AI personal trainer: a Custom GPT coaching and conversation layer backed by a Vercel-hosted application and durable athlete training state.

Each athlete has a distinct identity, goals, training priorities, metrics, locations/equipment, plans, history and configurable coach persona. The shared product name is **Coach**; individual athletes may name their trainer, for example **Coach Amy** or **Coach Ryan**.

## Current position

Lifecycle: **MVP implementation complete; owner validation is next**.

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

The MVP tests whether a persistent AI trainer can make personalised training planning and progression materially better than using an ordinary ChatGPT conversation without a durable training harness.

## Delivery source of truth

Linear team: **Coach**.

Active project: **First MVP: Persistent personal coach**.

The approved autonomous implementation scope is **CCH-1 through CCH-26**, ending at one test-ready MVP candidate. **CCH-27 and CCH-28 remain owner-led real-athlete validation and reconciliation.**

Linear is the delivery/roadmap cockpit. GitHub remains durable product/technical memory and implementation evidence.

## Start here

- [`AGENTS.md`](AGENTS.md)
- [`docs/SSOT.md`](docs/SSOT.md)
- [`docs/product/mvp-approved-scope.md`](docs/product/mvp-approved-scope.md)
- [`docs/product/product-definition.md`](docs/product/product-definition.md)
- [`docs/product/athlete-foundation.md`](docs/product/athlete-foundation.md)
- [`docs/product/weekly-planning.md`](docs/product/weekly-planning.md)
- [`docs/product/workout-execution.md`](docs/product/workout-execution.md)
- [`docs/product/progress-learning.md`](docs/product/progress-learning.md)
- [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md)
- [`docs/architecture/mvp-technical-contract.md`](docs/architecture/mvp-technical-contract.md)
- [`docs/product/future-possibilities.md`](docs/product/future-possibilities.md)

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

The governing principle is **LLM-reasoned and code-grounded**. The GPT supplies coaching judgement and semantic interpretation; code owns trusted identity boundaries, durable facts, plans, actuals, metrics, validation, provenance and state history.

The implemented MVP uses Next.js, TypeScript, Zod, Drizzle/PostgreSQL, Vitest/PGlite and Playwright. Start with [`docs/architecture/implemented-mvp.md`](docs/architecture/implemented-mvp.md) and [`docs/operations/setup-and-deployment.md`](docs/operations/setup-and-deployment.md) for current implementation and setup reality.

## Development

Copy `.env.example` to `.env.local`, provide a dedicated Coach database and distinct household/Action secrets, then run:

```bash
npm install
npm run db:migrate
npm run db:check
npm run dev
```

Run `npm run verify` for the local static, test, GPT-package and production-build gate. Browser E2E uses `npm run test:e2e`; set `PLAYWRIGHT_BASE_URL` and `E2E_PASSPHRASE` for the protected Preview.

## Repository safety

Do not commit athlete health/fitness data, access credentials, API secrets, HealthKit exports or other personal data to this repository. Runtime athlete data belongs in the application data layer, not Git history.

The repository is currently public, so this rule is especially important. Repository visibility is not itself an authentication boundary for the deployed product.
