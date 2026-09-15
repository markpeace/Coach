# Private Coach MCP plugin architecture

Status: Current for CCH-29

## Decision

Coach's supported conversational surface is moving from a Custom GPT Action to a **private ChatGPT custom MCP app**. The app remains a thin adapter over the existing Coach domain service and Neon ledger.

`ChatGPT private Coach app → OAuth-protected /mcp → executeOperation() → Neon`

The web app continues to call the same domain service through `/api/v1/action`. No second athlete memory, planning engine or workout model is introduced.

## MCP transport

The remote endpoint is `/mcp` and uses the official TypeScript MCP server SDK v2. The handler serves the modern 2026-07-28 protocol and its stateless 2025 compatibility path from the same endpoint.

The MCP surface deliberately exposes:

- dedicated read tools for athlete list/context, weekly planning context, plan/today, exercise history and progress;
- one bounded write tool backed by the existing validated `CoachOperation` union.

Read tools are annotated read-only. The write tool is annotated as closed-world, destructive-capable and idempotent so the host can apply appropriate confirmation behaviour.

## Authentication

The private development app uses OAuth Authorization Code + PKCE.

The Coach service acts as both protected resource and small single-household authorization server:

- `/.well-known/oauth-protected-resource`
- `/.well-known/oauth-authorization-server`
- `/oauth/register` for dynamic public-client registration
- `/oauth/authorize` for household authorization
- `/oauth/token` for code exchange and refresh
- `/mcp` as the protected resource

Authorization requires the existing household passphrase. OAuth signing uses a domain-separated key derived from `SESSION_SECRET`, so no new deployment secret is required.

Security properties:

- HTTPS-only redirect URIs, except localhost for development;
- PKCE S256 is mandatory;
- authorization codes expire after five minutes and are one-time through `mcp_oauth_codes`;
- access tokens expire after one hour;
- refresh tokens expire after seven days;
- tokens are issuer-bound to the exact Coach host;
- `/mcp` fails closed without a valid Coach-scoped bearer token;
- the MCP adapter cannot bypass athlete scoping, optimistic versions, idempotency or domain validation because all operations still pass through `executeOperation()`.

This is intentionally a private MVP authorization service, not a general identity platform. Public multi-user distribution would require a fresh auth/security review.

## Conversational behaviour

The existing `gpt/` package remains durable migration material and behavioural guidance, but OpenAPI Actions are no longer the active integration contract. The acceptance scenarios remain the behavioural contract for the conversational surface.

The model must still:

- establish the active athlete explicitly;
- use the durable ledger rather than prose memory;
- preserve accepted plan baselines and explicit adaptations;
- distinguish prescription, actuals, feedback and interpretation;
- never claim writes succeeded when a tool returned an error.

## Deployment

CCH-29 remains Preview-only. The intended private app server URL is the stable owner-test branch alias plus `/mcp`.

The ChatGPT server must be able to reach the MCP/OAuth URLs without an upstream Vercel login wall. If Preview Protection blocks the scan, resolve that at the Vercel access layer for the dedicated owner-test endpoint/domain; do not weaken Coach's own OAuth requirement.

## Verification contract

Before CCH-29 is Done:

1. apply the additive OAuth-code migration to the dedicated Coach Preview database;
2. pass lint/typecheck/tests/build, including MCP OAuth unit tests;
3. verify public OAuth metadata and unauthenticated MCP 401 behaviour;
4. scan the MCP endpoint successfully from ChatGPT's private New Plugin flow;
5. complete OAuth with the household passphrase;
6. verify tool discovery;
7. execute a representative read and write from ChatGPT;
8. independently confirm the write in Neon/web app;
9. verify a cross-athlete object request fails closed;
10. reconcile CCH-26 and durable setup/deployment docs.

No public directory submission and no production promotion are part of this work.
