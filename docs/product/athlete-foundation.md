# Coach athlete foundation

Status: Current

## Purpose

Define the minimum durable athlete state Coach needs before it can plan and coach intelligently. This is a product-model contract, not a committed SQL schema.

## Core principle

The athlete is the root of Coach state. Plans, workouts, metrics, goals, feedback and coaching interpretation must remain explicitly athlete-scoped.

A shared Custom GPT may select the conversational athlete, but conversational selection is not cryptographic authentication. The product must keep athlete selection deliberate and prevent accidental cross-athlete reads or writes.

## Athlete

The athlete record should remain small and relatively stable. It may include:

- name and display name;
- timezone;
- active/inactive state;
- current Coach persona reference;
- creation/history metadata.

Information that changes over time should normally live in a time-aware domain object rather than being flattened into a large permanent profile.

## Conversational athlete selection

A shared Coach conversation should not infer the athlete silently.

When no athlete is established, Coach should ask who it is coaching and use a bounded athlete-selection operation. Once selected, subsequent reads and writes remain explicitly scoped to that athlete until a deliberate switch.

Examples such as `It's Helen now` may trigger a deliberate athlete switch. Free-form conversation alone must not cause hidden cross-athlete state selection.

For the private MVP, this selection boundary is primarily about reliable state separation rather than pretending the shared GPT can cryptographically prove which household member typed a message.

## Coach persona

Each athlete may configure one current trainer persona, for example Coach Amy or Coach Ryan.

Persona is relationship and presentation context, not a separate training engine. Useful fields may include:

- trainer forename;
- warmth/directness;
- encouragement level;
- amount of explanation;
- humour/personality preferences;
- preferred degree of challenge.

Prefer a concise editable trainer brief, supported by a few structured defaults where useful, over a large matrix of sliders.

Persona must not alter athlete identity boundaries, trusted data rules or core coaching safeguards.

## Training priorities

Training priorities are relatively durable areas of emphasis that help Coach resolve trade-offs when time is limited.

A simple MVP scale is sufficient:

- Primary;
- Develop;
- Maintain;
- Not currently prioritised.

Examples may include running performance, strength, cycling fitness, mobility or general conditioning. Common categories should be supported without preventing athlete-defined priorities.

## Goals

Goals are athlete outcomes and must support both quantitative and qualitative forms.

Coach must not assume that every meaningful goal can be reduced to one number.

Useful goal types include:

### Performance

Examples: target 5K time, pull-up target, cycling FTP target or strength performance.

### Physique

Examples: develop chest and upper-body musculature, improve shoulder definition, maintain lower-body size while changing upper-body proportion.

Physique goals are not synonymous with weight loss or body-fat reduction.

### Health / fitness

Examples: improve cardiovascular fitness, maintain regular bone-loading strength work or build general aerobic capacity.

Coach may programme for training outcomes and interpret training evidence, but must not convert these goals into unsupported medical claims or diagnosis.

### Body composition

Where explicitly chosen by the athlete, goals may use weight, body composition or measurements as indicators without assuming those metrics matter to every athlete.

### Capability

Examples: run continuously for an hour, complete a particular hike or regain a useful movement capacity.

A goal may include:

- title and description;
- goal type;
- status;
- athlete priority;
- optional baseline;
- optional quantitative or qualitative target;
- optional target date;
- one or more progress indicators;
- current Coach assessment;
- assessment timestamp/evidence context.

The current Coach assessment is interpretative state and must remain distinguishable from factual targets and measured results.

## Events

Dated events such as races are separate first-class objects that may link to one or more goals.

An event may include:

- event type/name;
- date;
- distance or relevant details;
- optional target outcome;
- linked goals.

Events can influence training structure even when the athlete has not set a numeric performance target.

## Locations and equipment

Locations are reusable training contexts such as home, gym, outdoors or a temporary travel location.

A location may contain structured equipment records. Equipment should be specific enough to support prescription and substitution, with type-specific attributes where useful, without requiring bespoke database columns for every device or machine.

Temporary locations should be easy to create and retire without cluttering the permanent athlete profile.

## Metrics

Coach uses an extensible athlete-specific time-series metric model.

Conceptually:

```text
MetricDefinition
  athlete
  type
  display name
  unit
  tracking status

MetricReading
  metric definition
  timestamp/date
  value
  source/provenance
  optional context/confidence
```

Potential metrics include body weight, body-fat percentage, lean/muscle mass, resting heart rate, FTP, VO2 max estimates, running benchmarks and athlete-defined measurements.

Each athlete chooses what they track. Source/provenance must exist from the beginning so later Apple Health or other ingestion can attach to the same ledger without redesigning the model.

## Temporary context is not profile state

Short-lived circumstances such as soreness, travel, poor sleep, temporary exercise restrictions or limited equipment should not become permanent athlete traits.

They belong in time-bounded planning/readiness context and should influence only the period for which they are relevant.

## Athlete-facing experience

The Athlete surface should communicate who Coach understands the athlete to be, not expose a database form.

A useful hierarchy is:

- athlete and Coach name/persona;
- current training focus/priorities;
- active goals and Coach assessment;
- upcoming events;
- training locations/equipment;
- tracked metrics and trends.

Editing and history can sit beneath those sections.

## Conceptual model

```text
Athlete
  ├── CoachPersona
  ├── TrainingPriorities
  ├── Goals
  ├── Events
  ├── Locations[]
  │     └── Equipment[]
  └── MetricDefinitions[]
        └── MetricReadings[]
```

This foundation is sufficient for MVP planning. Weekly availability and temporary readiness/context are intentionally modelled with planning rather than as permanent athlete profile fields.
