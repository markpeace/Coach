# Coach MVP implementation

Status: Current

## Delivered architecture

Coach is a single Next.js App Router application containing the responsive web client and a bounded `/api/v1/action` service surface. Both clients reach the same validated operation contracts and database-backed domain service.

```text
Private web app session     Custom GPT bearer key
          |                         |
          +---- /api/v1/action -----+
                       |
              Zod operation contract
                       |
             trusted domain service
                       |
       dedicated Coach Neon PostgreSQL
```

The web app has Today, Plan, Progress and Athlete as its four top-level surfaces. Workout execution uses `/workout` from Today or Plan.

## Persistence

The dedicated Neon project is `coach-mvp-preview` (`tiny-fire-17217098`) in `aws-eu-west-2` (London), PostgreSQL 18. Repository migration `drizzle/0000_initial.sql` creates the current schema.

All durable athlete state tables carry an explicit `athlete_id`. Flexible, validated domain content uses JSONB where its shape is expected to evolve, while plans, versions, workouts, sets, metrics, reviews and idempotency records remain separate queryable relations.

The current schema keeps:

- the accepted plan baseline in `plan_versions` and `plans.baseline_version`;
- the current effective version separately;
- original prescription, effective prescription and actual workout data in distinct columns;
- athlete feedback on the workout and Coach interpretation in observations/reviews;
- source/provenance on metric and workout evidence writes;
- retry results in `idempotency`, keyed by the exact request hash.

## Access and trust

The private web boundary uses a server-side household passphrase and a signed, seven-day, secure/httpOnly session cookie. Login attempts are limited per runtime instance. The Custom GPT uses a separate bearer credential. Every athlete operation still requires explicit athlete scope.

This is household access and deliberate state separation. It is not individual identity proof between athletes in the household.

## API

`POST /api/v1/action` accepts a discriminated set of task operations. It does not expose unrestricted CRUD. Runtime Zod contracts drive request validation and the checked-in OpenAPI request schema. Responses use `{ ok: true, data }` or structured `AUTH`, `VALIDATION`, `NOT_FOUND`, `CONFLICT` and `DATABASE` errors.

Material writes carry an idempotency key. Plans and workouts use optimistic versions. A stale write returns a conflict rather than overwriting current state.

## Coaching boundary

No backend model is present. The Custom GPT owns conversation, coaching judgement and semantic inspection of athlete-provided screenshots or supported files. The server accepts only validated structured facts, source metadata, athlete feedback and concise labelled interpretation. It does not parse the source evidence or store hidden model reasoning.

## Reproducible GPT package

`gpt/` contains version 0.1.0 instructions, generated OpenAPI, authentication notes, acceptance scenarios, manifest and combined SHA-256 checksum. `npm run gpt:verify` proves the packaged request schema matches the runtime operation schema.

## Deliberate MVP limits

The app does not include automatic activity ingestion, GPS/sensors, Apple Health, Strava, native apps, calendar, nutrition, public accounts/billing, medical scoring or a deterministic progression engine. Athlete-provided source files/images are inspected in ChatGPT and are not uploaded to Coach storage.
