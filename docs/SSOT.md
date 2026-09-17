# Coach source of truth

Status: Current

## Purpose

This document routes future product and implementation work to the smallest authoritative source needed.

## Authority order

1. Current direct product-owner instruction.
2. Approved active Linear execution scope.
3. Current repository source-of-truth documents.
4. `AGENTS.md` repository execution rules.
5. Specific current product, architecture or technical contracts.
6. `README.md` orientation.
7. Implementation and deployment evidence.
8. Clearly marked Planning, Historical or Superseded material.

If sources conflict, surface the conflict rather than silently choosing a lower-authority source.

## Current durable product memory

- `docs/product/product-definition.md`: landed product purpose, user model, experience principles and known domain concepts.
- `docs/product/athlete-foundation.md`: athlete identity, persona, priorities, qualitative/quantitative goal model, events, locations/equipment and metrics foundation.
- `docs/product/weekly-planning.md`: weekly planning ritual, availability, temporary context, plan lifecycle, session intent, adaptation and athlete preference model.
- `docs/product/workout-execution.md`: workout execution model, prescription/effective/actual separation, modality-aware logging, athlete-provided evidence, adaptation and feedback boundary.
- `docs/product/progress-learning.md`: progress, weekly review, goal assessment, coaching observation and next-week learning model.
- `docs/product/mvp-approved-scope.md`: historical MVP v1 implementation approval boundary; use Linear for current v2 scope.
- `docs/product/mvp-definition.md`: detailed MVP v1 design history/hypothesis.
- `docs/product/future-possibilities.md`: credible future pathways that should not silently enter current delivery.

## Current conversational/architecture memory

- `docs/architecture/system-architecture.md`: high-level system shape and model/code responsibility boundary.
- `docs/architecture/mvp-technical-contract.md`: MVP v1 implementation/access/API contract; retain for compatibility/history where not superseded.
- `docs/architecture/implemented-mvp.md`: delivered MVP v1 technical shape.
- `docs/architecture/private-mcp-plugin.md`: private OAuth-protected ChatGPT MCP integration.
- `docs/architecture/coach-skill.md`: MVP v2 skill/MCP/domain responsibility split and skill packaging decision.
- `skills/coach/SKILL.md`: versioned Coach behavioural operating model.
- `skills/coach/references/behavioral-acceptance.md`: behavioural scenarios used to detect conversational regressions.
- `docs/operations/setup-and-deployment.md`: current Preview/Neon/Vercel operational topology.

## Delivery state

Coach has moved from MVP v1 implementation and owner validation into an active MVP v2 increment while real-athlete validation continues in parallel.

Linear team: **Coach**.

Active project: **MVP v2: Observable, evidence-rich coaching**.

The original project **First MVP: Persistent personal coach** remains relevant for CCH-27 real-athlete evidence and CCH-28 reconciliation. Real-use evidence can still reorder, narrow or stop v2 work.

MVP v2 priorities currently include:

- explicit Coach skill / behavioural contract;
- safe non-destructive evolution of live athlete data;
- structured decision traces and athlete diagnostic export;
- richer modality-appropriate evidence ingestion;
- selective progress visualisation;
- integrated real-use validation.

Linear is the delivery cockpit. Do not create a second backlog in GitHub.

## Live-data preservation

Coach now contains real athlete history in the dedicated Neon ledger. Treat it as production-like state even though the application remains Preview-only.

The CCH-31 preservation contract governs any durable-state-changing v2 work:

- no destructive reset/reseed shortcuts on the live branch;
- prefer additive/backward-compatible migrations;
- create a named manual Neon snapshot immediately before each state-affecting migration;
- use temporary Neon branches/PGlite for migration experiments;
- capture pre-change continuity/integrity evidence and verify it after migration;
- prefer forward repair when post-migration athlete writes would otherwise be lost;
- any branch replacement/restore that can discard newer writes requires explicit product-owner approval.

The baseline pre-v2 snapshot created during CCH-31 is named `cch31-pre-v2-live-baseline-2026-09-17`.

## Documentation status meanings

- **Current**: authoritative durable understanding.
- **Draft**: being shaped and not yet authoritative.
- **Planning**: credible future direction, not current scope.
- **Historical**: retained for context but no longer current.
- **Superseded**: explicitly replaced by another source.
- **Needs review**: may be stale or contradictory.

## Repository rule

GitHub records durable understanding and implementation evidence. It must not become a second backlog or a storage location for live athlete data, diagnostic exports or credentials.