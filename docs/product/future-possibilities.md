# Coach future possibilities

Status: Planning

## Purpose

This document preserves credible product pathways that have emerged during discovery without allowing them to distract from or silently expand the MVP.

Nothing in this document is current delivery scope unless a later product decision promotes it into Linear and the current MVP/product definition.

## Apple Health ingestion

A strong post-MVP pathway is to use Apple Health as an athlete-authorised aggregation layer for workout and body-metric evidence.

Potential staged route:

1. use a third-party HealthKit exporter to POST selected Apple Health data into a Coach HTTPS ingestion endpoint;
2. normalise imported workouts/metrics into Coach's source-neutral athlete ledger;
3. later replace the third-party bridge with a thin native Coach iPhone companion using HealthKit directly.

This supports the desired experience that an athlete can finish a workout and later ask Coach to interpret it without manually re-entering everything.

Background HealthKit syncing is eventual rather than guaranteed real-time and should not be treated as a live telemetry channel.

## Strava

Per-athlete OAuth integration is technically possible, but as of September 2026 Strava's API policy restricts use of Strava API data in AI application context/working memory and limits ordinary API caching.

Therefore Strava-to-GPT coaching must not be assumed as an authorised pathway.

Potential future routes include:

- an official Strava MCP route if it becomes usable with Coach's architecture;
- explicit Strava approval for the intended use case;
- permitted athlete-facing visualisation or interoperability that does not feed prohibited Strava data into the AI coaching context.

Coach should not depend on Strava as its canonical training ledger.

## Native iPhone app

The web MVP should remain mobile-first and PWA-friendly, while the underlying domain/API contracts stay client-neutral.

A later iPhone app could use Capacitor for substantial shared web UI where appropriate, with native Swift components/plugins for capabilities that require genuine iOS APIs.

Do not assume the eventual native app will be only a thin PWA wrapper. HealthKit, watchOS and Bluetooth features may require meaningful native implementation.

## Apple Watch and HealthKit workout execution

Later versions may include:

- a Coach watchOS app;
- starting/ending workouts from Watch or phone;
- live heart-rate and workout sensor capture;
- exercise/set/interval progress from the wrist;
- mirrored iPhone/Watch workout state;
- writing completed workouts into HealthKit and Coach's own ledger.

An intermediate pathway may use Apple's WorkoutKit to create/schedule structured workouts for execution in Apple's own Workout app before Coach needs a full custom watchOS workout player.

## Connected cycling and Bluetooth

Smart-trainer control is a credible later capability, not MVP scope.

Potential capabilities include:

- Bluetooth Low Energy connection to compatible trainers;
- Fitness Machine Service (FTMS) telemetry such as power/cadence where supported;
- structured interval execution;
- ERG/target-power or resistance control where the trainer exposes the relevant FTMS controls;
- a deliberately tested supported-device list rather than claiming universal compatibility.

### Browser experiment

Web Bluetooth on supported desktop/Android Chromium browsers may provide a relatively cheap way to prototype trainer telemetry and control from the existing web application before committing to full native development.

Safari/iOS browser support remains a limiting factor, so browser Bluetooth should be viewed as an experiment/proving route rather than a universal product solution.

The desired future product is a focused Coach-prescribed workout player, not a replacement for virtual-world products such as Zwift.

## Calendar-aware scheduling

A future version may use calendar context to help place planned sessions into realistic times, while preserving the distinction between training intent and calendar authority.

This should only be pursued if real use shows that manually supplying weekly availability is a recurring burden.

## Richer automated evidence

Future sources may include:

- Apple Watch / HealthKit;
- body-composition scales writing to Apple Health;
- direct Bluetooth heart-rate/power sensors;
- permitted fitness-platform integrations;
- Coach's own native workout recording.

All sources should normalise into the same athlete ledger and preserve provenance.

## Explicit non-goal

Do not turn this pathway into a general health, nutrition or social-fitness platform by accumulation. New integrations should be justified by whether they materially improve coaching, training execution or progress understanding.
