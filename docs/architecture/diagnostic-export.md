# Athlete diagnostic export

Status: MVP v2 implementation contract for CCH-37.

## Purpose

Coach can produce a read-only, athlete-scoped JSON bundle for offline product diagnosis. The bundle exists to answer a concrete question: given the durable evidence available to Coach, what did the system know, what decisions were recorded, and what durable objects resulted?

The export is diagnostic evidence, not a backup format and not a second source of truth. Neon remains the canonical persistent store.

## Authentication and scope

The download endpoint is available only to an authenticated Coach household web session. Every request requires one explicit athlete UUID. The export service queries athlete-owned tables by that UUID and the shape layer applies a second athlete-id filter before serialization.

The bundle intentionally excludes other athletes, OAuth material, household/session credentials, migration state, idempotency records, raw transcripts and hidden reasoning.

## Format

Current format identifier: `coach-athlete-diagnostic-export`.

Current version: `1.0.0`.

Top-level fields:

- `manifest`: format/version, generation time, athlete id, exported sections, row counts, provenance note and explicit exclusion statement;
- `athlete`: the selected canonical athlete record;
- `ledger`: canonical athlete-owned durable records for context, metric definitions/readings, weekly context, plans/versions, athlete-owned exercises, workouts, set actuals, reviews, observations and decision traces;
- `timeline`: compact decision-trace chronology linking intent, evidence and output references where those links were recorded.

Source/evidence/runtime metadata already stored on canonical records is preserved. The export does not infer missing provenance or reconstruct chain-of-thought.

## Evolution rule

Future additive fields may be added without changing the format identifier. A breaking structural or semantic change requires an export version increment and compatibility note. Export generation must remain read-only against athlete state.
