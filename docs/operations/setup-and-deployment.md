# Coach setup and deployment

Status: Current

## Local setup

Requirements: Node.js 22 or later and PostgreSQL compatible with the checked-in migration.

1. Copy `.env.example` to `.env.local` and supply all values.
2. Run `npm install`.
3. Run `npm run db:migrate` against a new or existing Coach-only database.
4. Run `npm run db:check`.
5. Run `npm run dev` and open `/login`.

Never use real athlete data in a local/shared test database or commit an environment file.

## Fictional reset strategy

For an empty test environment, create a fresh Neon branch/database and run the migration. Automated PostgreSQL integration tests use an in-process PGlite database and fictional fixtures. The migration and application do not include a destructive reset command.

## Vercel topology

The owner-test environment is the dedicated Vercel project `coach` (`prj_upoz4N1DtIrWDydxPcgLBCx7Dn5C`) in the `mark-peaces-projects-a5248ac1` team, linked to `markpeace/Coach` through Git integration. CCH-26 owner testing uses the dedicated `preview/coach-mvp-owner` branch. Its stable branch alias and Action origin is `https://coach-git-preview-coach-mvp-owner-mark-peaces-projects-a5248ac1.vercel.app`.

Pushes to `preview/coach-mvp-owner` create Preview deployments automatically. Preview is the only authorised target during MVP testing. Do not push `main`, create a duplicate manual deployment, or promote production as part of CCH-26.

Preview-only environment variables:

- `DATABASE_URL`: pooled connection string for the dedicated `coach` database;
- `HOUSEHOLD_PASSPHRASE`: private web access secret;
- `SESSION_SECRET`: at least 32 random characters;
- `GPT_ACTION_API_KEY`: a separate bearer key;
- `NEXT_PUBLIC_APP_URL`: `https://coach-git-preview-coach-mvp-owner-mark-peaces-projects-a5248ac1.vercel.app`.

## Authoritative deployment path

The authoritative path for the MVP candidate is a single Git-integrated Preview deployment from `preview/coach-mvp-owner`. Batch related fixes, verify locally first where tooling permits, then push one coherent commit and use the resulting branch Preview. Do not manually deploy the same SHA.

Use local lint, typecheck, unit/integration tests, GPT package verification and `next build` before the remote deployment where the execution environment permits them. Remote deployment exists to prove Vercel, Neon, cookie/auth and browser behaviour together.

## Migration release rule

Apply additive repository migrations to the target Preview database before or with a compatible application deployment. Verify `coach_migrations` and the expected table count. Production migrations and promotion require a separate explicit release decision.

## Preview checks

After deployment:

1. `/api/v1/health` returns `service: coach`, `status: ok`, `version: 0.1.0`.
2. `/today` redirects to `/login` without a household session.
3. Valid household login sets an httpOnly cookie and reaches the app.
4. Invalid bearer authentication returns 401 from `/api/v1/action`.
5. Valid web and Action calls reach the dedicated Neon database.
6. The Playwright MVP loop passes at mobile and desktop widths.

## Production

Production is intentionally unconfigured/unpromoted for this MVP handback. Owner validation and reconciliation in CCH-27/28 precede any production-release decision.
