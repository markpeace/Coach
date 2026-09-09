# Coach MVP verification map

Status: Current

## Automated checks

| Command | Coverage |
|---|---|
| `npm run lint` | Next.js, React, TypeScript and repository static rules |
| `npm run typecheck` | Strict TypeScript contracts across UI, API, domain and scripts |
| `npm test` | Domain validation/invariants, Action authentication/envelopes, PostgreSQL migration and trust schema |
| `npm run test:db` | Fresh migration, athlete isolation, baseline/effective/actual separation and idempotency constraints |
| `npm run test:api` | Household denial/success, separate service authentication and structured validation failure |
| `npm run gpt:verify` | GPT package completeness, version alignment, Action route and exact runtime/OpenAPI request-schema equality |
| `npm run build` | Optimised Next.js production build |
| `npm run test:e2e` | Remote or local browser loop across two athletes, context, planning, lock/adapt, workouts, evidence, progress and review |

## Key regression protections

- Athlete scope: contract requirement, scoped SQL predicates, cross-athlete PostgreSQL and browser negative checks.
- Plan history: pure invariant tests, version rows, baseline reference and browser draft/revise/lock/adapt path.
- Workout state: optimistic versions, closed-state rejection, separate JSON columns and browser strength/run/cycle completion.
- Evidence/interpretation: source schema, partial-evidence tests and distinct workout feedback/observation records.
- GPT contract: generated OpenAPI plus exact schema comparison in `gpt:verify`.
- Persistence: checked-in SQL migration, PGlite fresh-database test and live Neon schema verification.

The final implementation/deployment-specific results are recorded in the CCH-26 Linear evidence and Work handback.
