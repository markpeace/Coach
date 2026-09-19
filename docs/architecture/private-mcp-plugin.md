# Private Coach MCP plugin architecture

Status: Current

## Decision

Coach's supported conversational capability surface is a **private ChatGPT MCP app** backed by the existing Coach domain service and Neon ledger. During MVP v2 validation, a repository-owned **Coach Preview** plugin carries the canonical Coach Skill and references that registered Preview app rather than declaring a second MCP server.

```text
Coach Preview plugin
  + repository-owned Coach skill
        ↓
registered Preview workspace app
        ↓
OAuth-protected /mcp
        ↓
executeOperation()
        ↓
Neon athlete ledger
```

The web app continues to call the same domain service through `/api/v1/action`. No second athlete memory, planning engine or workout model is introduced.

## Responsibility split

- **Coach skill:** cross-tool coaching behaviour, onboarding cadence, context-read economy, planning/revision/lock/adaptation workflow, evidence handling, persistence use, truthful failure behaviour and decision-trace guidance.
- **MCP tools:** bounded read/write capabilities and operation-specific semantics.
- **Domain/server:** authentication boundaries, athlete isolation, validation, idempotency, versions/conflicts and durable-state invariants.

See `docs/architecture/coach-skill.md`, `docs/architecture/chatgpt-plugin-packaging.md` and `skills/coach/SKILL.md`.

## MCP transport

The remote endpoint is `/mcp` and uses the TypeScript MCP server SDK v2. The handler serves the modern protocol and its stateless compatibility path from the same endpoint.

The MCP surface deliberately exposes:

- dedicated read tools for athlete list/context, weekly planning context, plan/today, exercise history and progress;
- one bounded write tool backed by the validated `CoachOperation` union.

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

The active behavioural contract is the repository-owned Coach skill at `skills/coach/SKILL.md` plus its behavioural acceptance reference. The legacy `gpt/` package remains migration/history material; OpenAPI Actions are no longer the active integration contract.

The model must still:

- establish the active athlete explicitly;
- use the durable ledger rather than prose memory;
- preserve accepted plan baselines and explicit adaptations;
- distinguish prescription, actuals, feedback and interpretation;
- never claim writes succeeded when a tool returned an error;
- avoid exhaustive onboarding or unnecessary context reads;
- never persist hidden chain-of-thought.

## Plugin/app environment identity

During validation the user-facing plugin is **Coach Preview**. It references registered app `asdk_app_6aa945279bc081919c667652d14c5646`, whose intended workspace display name is **Coach Preview MCP**.

**Coach** and **Coach MCP** are reserved for a later production release. Do not turn the Preview integration into Production by repointing its endpoint.

The plugin binds the registered workspace app through `.app.json`. Do not add plugin-local `mcp.json`, `.mcp.json` or an inline MCP declaration: the registered app already owns OAuth, workspace access, action controls and the MCP connection.

## Deployment

The private app remains Preview-only unless a separate production release is approved. The stable owner-test MCP URL uses the owner-test branch alias plus `/mcp`.

The ChatGPT server must be able to reach the MCP/OAuth URLs without an upstream Vercel login wall. If Preview Protection blocks the scan, resolve that at the Vercel access layer for the dedicated owner-test endpoint/domain; do not weaken Coach's own OAuth requirement.

A repository change does not automatically justify a new Preview. Batch coherent runtime changes and avoid duplicate Git/manual deployments.

## Verification contract

For conversational-surface changes:

1. preserve current MCP authentication and tool discovery;
2. pass static/type/test/build checks relevant to the change;
3. verify cross-athlete failures remain closed;
4. verify behavioural scenarios relevant to the changed skill/tool semantics;
5. if live durable state changes, follow the CCH-31 preservation/snapshot/migration contract first;
6. use one coherent remote Preview only when remote integration evidence is actually required.

No public directory submission and no production promotion are implied by MVP v2 work.