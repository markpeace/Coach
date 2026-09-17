# Coach skill architecture

Status: Current for MVP v2

## Decision

Coach has an explicit repository-owned Agent Skill that describes how the conversational coach should orchestrate the private Coach MCP app. The skill is versioned independently from the MCP server and domain schema so later diagnostic traces can record which behavioural contract was active.

The governing split is:

```text
Coach skill
  behavioural workflow and conversational operating model
        ↓
Private Coach MCP app
  bounded reads/writes and operation semantics
        ↓
Coach domain service
  athlete isolation, validation, versions, idempotency and invariants
        ↓
Durable PostgreSQL athlete ledger
```

The skill must improve behavioural consistency without becoming the only enforcement point for trusted state.

## Package

The skill lives at:

`skills/coach/SKILL.md`

and follows the open Agent Skills format used by OpenAI Skills: a skill directory with required `SKILL.md` YAML frontmatter plus Markdown instructions. Detailed behavioural scenarios live one level below at:

`skills/coach/references/behavioral-acceptance.md`

The skill is intentionally repository-owned even when a particular ChatGPT account or surface cannot install Personal Skills directly. This keeps the behavioural contract version-controlled and portable.

## Behavioural responsibilities

The skill owns cross-tool behaviour such as:

- explicit athlete selection and deliberate switching;
- conversational onboarding to coaching sufficiency rather than schema completeness;
- choosing the smallest trusted context read for the job;
- context-led weekly planning and natural revision;
- explicit lock and accepted post-lock adaptation;
- conservative screenshot/file evidence interpretation;
- making persistence visibly useful without narrating tool mechanics;
- asking only decision-changing questions;
- truthful write/failure handling;
- deciding which conversational outcomes deserve durable state;
- producing concise decision traces when that v2 capability is available.

## What remains outside the skill

The MCP/domain layers must continue to enforce:

- authentication and authorization;
- athlete-scoped object access and cross-athlete isolation;
- validated operation shapes;
- stale-version/conflict rules;
- idempotency;
- locked-plan baseline/current-version integrity;
- relational/database integrity.

A prompt regression must not make those guarantees disappear.

## Relationship to the legacy Custom GPT package

`gpt/instructions.md` and `gpt/acceptance-scenarios.md` are retained as migration/history material. Their strongest behavioural rules have been translated into the v2 skill, while real-athlete MVP validation added stronger emphasis on:

- one-question-at-a-time onboarding;
- stopping when enough context exists to coach credibly;
- interaction economy and narrow context reads;
- avoiding a database-form experience;
- making persistence useful in normal coaching language;
- structured decision-trace readiness rather than hidden reasoning capture.

OpenAPI Actions are not the active conversational integration. The supported connected surface remains the OAuth-protected private MCP app.

## Verification

`tests/coach-skill.test.ts` checks package/frontmatter basics and protects a small set of high-value behavioural contract statements from accidental removal. The richer scenarios in `skills/coach/references/behavioral-acceptance.md` remain behavioural acceptance material rather than unit-test substitutes.

A full conversational validation still requires a host surface capable of applying the skill together with the Coach MCP app.

## Versioning

The initial v2 skill version is `0.2.0`.

Increment the skill version when a behavioural change could materially alter coaching decisions or orchestration. Editorial-only changes do not necessarily require a version bump. Decision traces should store the skill version only when it is reliably available to the runtime or explicitly supplied by the skill/tool contract.

## Safety and privacy

The skill must never request or persist hidden chain-of-thought. Material coaching decisions should eventually be represented by concise structured decision traces. Raw athlete data, exports, OAuth material and credentials remain runtime data and must never be committed to Git.