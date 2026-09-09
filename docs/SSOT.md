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
- `docs/product/mvp-approved-scope.md`: current approval boundary for autonomous MVP implementation and its explicit exclusions.
- `docs/product/athlete-foundation.md`: current athlete identity, persona, priorities, qualitative/quantitative goal model, events, locations/equipment and metrics foundation.
- `docs/product/weekly-planning.md`: current weekly planning ritual, availability, temporary context, plan lifecycle, session intent, adaptation and athlete preference model.
- `docs/product/workout-execution.md`: current workout execution model, prescription/effective/actual separation, modality-aware logging, athlete-provided evidence, adaptation and feedback boundary.
- `docs/product/progress-learning.md`: current progress, weekly review, goal assessment, coaching observation and next-week learning model.
- `docs/product/mvp-definition.md`: detailed MVP design history/hypothesis; use `mvp-approved-scope.md` for current implementation authority where status differs.
- `docs/product/future-possibilities.md`: credible non-MVP pathways that should not silently enter current delivery.

## Current architecture memory

- `docs/architecture/system-architecture.md`: high-level system shape and GPT/code responsibility boundary.
- `docs/architecture/mvp-technical-contract.md`: current test-ready MVP implementation, access, API, deployment and verification contract.

## Delivery state

Coach has moved from approved MVP implementation into the test-ready handback boundary.

Linear team: **Coach**.

Active project: **First MVP: Persistent personal coach**.

Implementation scope **CCH-1 through CCH-26** is represented by the current application, migration, tests, GPT package and deployment documents. `docs/architecture/implemented-mvp.md` records the delivered technical shape; `docs/operations/setup-and-deployment.md` records the operational topology.

**CCH-27 and CCH-28 are owner-led follow-on validation/reconciliation and are not part of the autonomous build handoff.**

Linear is now the delivery cockpit. Do not create a second backlog in GitHub.

## Documentation status meanings

- **Current**: authoritative durable understanding.
- **Draft**: being shaped and not yet authoritative.
- **Planning**: credible future direction, not current scope.
- **Historical**: retained for context but no longer current.
- **Superseded**: explicitly replaced by another source.
- **Needs review**: may be stale or contradictory.

## Repository rule

GitHub records durable understanding and implementation evidence. It must not become a second backlog or a storage location for live athlete data.
