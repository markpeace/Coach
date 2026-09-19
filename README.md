# Coach

Coach is a multi-athlete AI personal trainer: a private conversational coaching layer backed by a Vercel-hosted application and durable athlete training state.

Each athlete has a distinct identity, goals, training priorities, metrics, locations/equipment, plans, history and configurable coach persona. The shared product name is **Coach**; individual athletes may name their trainer, for example **Coach Amy** or **Coach Ryan**.

## Current position

Lifecycle: **MVP v2 active; real-athlete validation continues in parallel**.

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

MVP v1 established that a persistent AI trainer is useful enough in real use to continue. MVP v2 focuses on making that coaching more explicit, evidence-rich, observable and visually legible while preserving the real athlete history already accumulating in Coach.

## Delivery source of truth

Linear team: **Coach**.

Active project: **MVP v2: Observable, evidence-rich coaching**.

The original **First MVP: Persistent personal coach** project remains the live validation evidence stream through CCH-27/CCH-28. Linear is the delivery/roadmap cockpit. GitHub remains durable product/technical memory and implementation evidence.

## Start here

- [`AGENTS.md`](AGENTS.md)
- [`docs/SSOT.md`](docs/SSOT.md)
- [`skills/coach/SKILL.md`](skills/coach/SKILL.md)
- [`docs/architecture/coach-skill.md`](docs/architecture/coach-skill.md)
- [`docs/architecture/private-mcp-plugin.md`](docs/architecture/private-mcp-plugin.md)
- [`docs/architecture/chatgpt-plugin-packaging.md`](docs/architecture/chatgpt-plugin-packaging.md)
- [`docs/architecture/system-architecture.md`](docs/architecture/system-architecture.md)
- [`docs/operations/setup-and-deployment.md`](docs/operations/setup-and-deployment.md)
- [`docs/product/product-definition.md`](docs/product/product-definition.md)
- [`docs/product/athlete-foundation.md`](docs/product/athlete-foundation.md)
- [`docs/product/weekly-planning.md`](docs/product/weekly-planning.md)
- [`docs/product/workout-execution.md`](docs/product/workout-execution.md)
- [`docs/product/progress-learning.md`](docs/product/progress-learning.md)

## Architecture direction

Coach now separates conversational behaviour, tool capabilities and trusted state explicitly:

```text
Athlete
  |
  +--> ChatGPT + Coach Agent Skill
  |      coaching behaviour, interpretation, judgement
  |             |
  |             +--> private OAuth-protected Coach MCP app
  |                        bounded athlete-scoped reads/writes
  |
  +--> responsive web application
         planning, workout execution, progress inspection, direct edits
                 |
                 +--> shared domain/service layer
                          athlete isolation, validation, versions, idempotency
                                   |
                                   +--> durable PostgreSQL athlete ledger
```

The governing principle is **LLM-reasoned and code-grounded**. The model supplies coaching judgement and semantic interpretation. The skill guides the conversational workflow. Code owns trusted identity boundaries, durable facts, plans, actuals, metrics, validation, provenance and state history.

The legacy `gpt/` package remains migration/history material; OpenAPI Actions are not the supported conversational surface.

During MVP validation the user-facing ChatGPT package is **Coach Preview**. Its repository manifest includes the canonical Coach Skill and references the existing registered Preview workspace app. **Coach** and **Coach MCP** are reserved for the later production release.

## Live-data safety

Coach now contains real athlete data. Existing athlete history must be preserved across MVP v2.

- No destructive reset/reseed shortcuts on the live Neon branch.
- Prefer additive/backward-compatible migrations.
- Create a named manual Neon snapshot immediately before any state-affecting live migration.
- Use temporary Neon branches or PGlite for destructive/testing experiments.
- Verify continuity and athlete isolation after migrations.
- Never commit athlete health/fitness data, exports, credentials, OAuth material or other personal data to Git.

See `docs/SSOT.md` and Linear CCH-31 for the preservation contract.

## Development

Copy `.env.example` to `.env.local`, provide the dedicated Coach database and private access secrets, then run:

```bash
npm install
npm run db:migrate
npm run db:check
npm run dev
```

Run `npm run verify` for the local static/test/build gate. Browser E2E uses `npm run test:e2e`; set `PLAYWRIGHT_BASE_URL` and `E2E_PASSPHRASE` for the protected Preview when applicable.

## Repository safety

Do not commit athlete health/fitness data, access credentials, API secrets, HealthKit exports, activity routes, diagnostic exports or other personal data to this repository.

The repository is currently public, so this rule is especially important. Repository visibility is not itself an authentication boundary for the deployed product.