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

## ChatGPT environment identity

During MVP validation:

- ChatGPT plugin: **Coach Preview** (repository package prepared; workspace import and integrated use pending verification)
- registered workspace app: `asdk_app_6aa945279bc081919c667652d14c5646`, current display name **Coach Preview MCP**
- MCP host: `https://coach-git-preview-coach-mvp-owner-mark-peaces-projects-a5248ac1.vercel.app/mcp`
- web host: the same stable owner-test branch alias
- database: the real persistent Coach ledger, treated as production-like state

The repository root is the **Coach Preview** plugin package because the canonical `skills/coach/SKILL.md` already lives under its root `skills/` directory.

The plugin references the registered workspace app through `.app.json`. Do not declare another MCP server in `mcp.json`, `.mcp.json` or inline plugin configuration.

The proposed GitHub marketplace lives at `.agents/plugins/marketplace.json`; exercise its import and source-path resolution before calling the plugin installed.

See `docs/architecture/chatgpt-plugin-packaging.md`.

## Production

Production is intentionally unconfigured/unpromoted during integrated MVP v2 validation. The names **Coach** and **Coach MCP** are reserved for the later production plugin and production workspace app.

A production release requires a separate explicit decision after validation/reconciliation. Create/configure the production Vercel endpoint first, then create **Coach MCP** against that endpoint, then bind the **Coach** plugin to that production app while reusing the same canonical Skill. Do not repoint **Coach Preview MCP** to Production.


## Private ChatGPT MCP surface

CCH-29 replaces the short-lived Custom GPT Action integration with a private custom MCP app. The stable owner-test MCP URL is:

`https://coach-git-preview-coach-mvp-owner-mark-peaces-projects-a5248ac1.vercel.app/mcp`

OAuth discovery and authorization are served by the same Coach host. The user authorizes with the existing household passphrase; the MCP endpoint itself requires the resulting Coach-scoped bearer token.

Before scanning the endpoint in ChatGPT:

1. ensure migration `0002_mcp_oauth_codes.sql` is applied to the dedicated Preview database;
2. verify `/.well-known/oauth-protected-resource` and `/.well-known/oauth-authorization-server` return metadata;
3. verify unauthenticated `/mcp` returns 401 with a `WWW-Authenticate` resource-metadata pointer;
4. confirm the stable owner-test host is reachable by ChatGPT without an upstream Vercel Authentication challenge.

The legacy `GPT_ACTION_API_KEY` and `gpt/openapi.json` remain during migration/rollback but are no longer the target conversational integration after CCH-29 is accepted.
