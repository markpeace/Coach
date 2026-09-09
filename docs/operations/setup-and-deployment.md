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

The intended owner-test environment is one dedicated Vercel project linked to `markpeace/Coach`. Preview is the only authorised target during MVP testing. `main` remains the repository default and Vercel production-branch assumption, but no production deployment or promotion is part of this implementation batch.

Preview-only environment variables:

- `DATABASE_URL`: pooled connection string for the dedicated `coach` database;
- `HOUSEHOLD_PASSPHRASE`: private web access secret;
- `SESSION_SECRET`: at least 32 random characters;
- `GPT_ACTION_API_KEY`: a separate bearer key;
- `NEXT_PUBLIC_APP_URL`: the final Preview origin.

## Authoritative deployment path

The authoritative path for the MVP candidate is a single Vercel Preview deployment from the final verified commit. If Git integration is enabled for the project, push the final feature/preview branch once and use the resulting automatic Preview. Do not also deploy the same SHA manually. If Git integration is unavailable, use one manual `vercel deploy` from the verified checkout.

Use local lint, typecheck, unit/integration tests, GPT package verification and `next build` before the remote deployment. Remote deployment exists to prove Vercel, Neon, cookie/auth and browser behaviour together.

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
