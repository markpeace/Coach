# Coach product definition

Status: Current

## Product concept

Coach is a persistent multi-athlete AI personal trainer.

It combines conversational coaching with a durable training harness so that an athlete does not have to repeatedly reconstruct goals, previous performance, current programme, available equipment or recent training context before receiving useful advice.

The product name is **Coach**. Each athlete can give their trainer a forename and configure its personality, for example **Coach Amy** or **Coach Ryan**.

## Primary product job

Help an athlete decide what training to do, fit it around real life, execute it with enough guidance and recording to know what actually happened, understand whether they are progressing, and use that evidence to make the next plan better.

## Core product loop

```text
Athlete goals + priorities
        +
real availability / location / equipment
        +
recent training evidence and metrics
        ↓
conversational weekly planning
        ↓
review / tweak / lock
        ↓
day-by-day training plan
        ↓
workout execution
        ↓
actual performance + qualitative feedback
        ↓
progress and coaching interpretation
        ↓
next coaching decision
```

## Athlete model

Coach is explicitly multi-athlete.

Each athlete has their own:

- identity;
- named/configured coach persona;
- training priorities;
- goals and events;
- metrics;
- locations and available equipment;
- availability;
- plans and sessions;
- workout actuals;
- qualitative feedback;
- training history;
- coaching observations/hypotheses;
- progress interpretation.

A shared GPT conversation must establish the active athlete before using athlete-specific state when identity is ambiguous. Conversational statements such as `It's Mark` may select the conversational athlete only through a bounded product operation; they must not bypass the application's athlete boundary.

Switching athlete should be deliberate and visible enough to avoid cross-athlete state contamination.

## Coach persona

Persona is athlete-specific presentation and relationship configuration, not a separate training system.

An athlete may choose:

- trainer forename;
- warmth/directness;
- amount of encouragement;
- amount of explanation;
- humour/personality preferences;
- how challenging or restrained the trainer should feel.

Persona must not change identity boundaries, trusted data rules or core coaching safeguards.

## Training priorities, goals and events

Coach distinguishes different levels of training intent.

### Training priorities

Relatively durable areas of emphasis such as cardiovascular fitness, strength, running performance, cycling fitness, mobility or general conditioning. Priorities help resolve trade-offs when available training time is limited.

### Goals

Specific outcomes that may be time-bounded or open-ended, for example a target 5K time, pull-up target or strength performance target.

A goal should be able to hold a baseline, target, progress measures, target date where relevant and the trainer's current evidence-based assessment.

### Events

Dated events such as a race can drive time-bounded training structure, testing and taper decisions.

## Metrics

Coach needs a generic athlete metrics ledger rather than separate bespoke systems for each measurement.

Potential metric types include:

- body weight;
- body-fat percentage;
- lean/muscle mass;
- resting heart rate;
- FTP;
- running benchmarks;
- estimated VO2 max where a source provides it;
- athlete-defined benchmark measures;
- other future fitness measurements.

Metrics are optional and athlete-specific. The product should emphasise useful trends and coaching interpretation rather than overstate precision in individual consumer-device readings.

## Locations and equipment

Training opportunities are constrained by where the athlete is and what is available there.

Coach therefore models named locations and their equipment, for example:

- home;
- local gym;
- work gym;
- outdoors;
- temporary hotel/travel location.

Equipment should be structured enough to support useful prescription and substitution, including relevant attributes such as available dumbbell range, machine type or cycling trainer capability where needed.

Temporary locations should be easy to add without creating permanent profile clutter.

## Availability

Weekly availability is product state distinct from the eventual plan.

An availability opportunity may include:

- date/day;
- available duration or window;
- location;
- available equipment through that location;
- relevant temporary context.

The trainer builds the programme inside these real constraints rather than generating an idealised plan first.

## Plans

The weekly plan is a first-class agreed training artefact.

A plan may move through a lifecycle including draft, locked/agreed, in progress and completed/superseded states.

A locked plan is an agreed baseline, not an immutable prison. Real life may require a session to move, shorten, substitute or change. Coach should preserve the original prescription and subsequent adaptation so that planned-versus-actual history remains intelligible.

## Sessions and prescriptions

A session should support different modalities while sharing a common planning/execution model.

Examples include:

- strength;
- running;
- cycling / Zwift;
- mobility or conditioning;
- future modalities without redesigning the core ledger.

A strength prescription may include exercises, sets, reps, load, rest and coaching guidance.

A run may include duration/distance, intensity/zone/pace guidance, intervals and optional technique/stride instructions.

A cycling session may include a named Zwift workout or a structured power/intensity prescription.

## Workout execution and actuals

Coach distinguishes **prescription** from **actual performance**.

The app should allow an athlete to start a planned workout and record completion at useful granularity. Strength work should support set-level actuals where useful rather than only a session-level tick.

The ledger should be able to preserve:

- prescribed work;
- actual work;
- adapted/substituted work;
- completion state;
- qualitative athlete feedback;
- imported activity evidence where available.

A completed checkbox alone is not enough to support intelligent progression.

## Qualitative feedback

Conversation remains a primary surface for richer coaching evidence.

An athlete should be able to say things such as:

- `Bench felt much harder than expected today.`
- `That run felt ridiculously easy.`
- `I only had 25 minutes so I cut the final exercise.`
- `My legs were unusually heavy.`

Coach should attach useful feedback to the relevant training context and use it proportionately in future judgement.

The app may also offer lightweight structured feedback such as Easy / About right / Hard / Very hard, but should not turn every workout into burdensome data entry.

## Coaching observations

Coach may form bounded hypotheses from repeated evidence, for example that treadmill and road performance differ materially for an athlete or that a particular progression is stalling.

Observations must be distinguishable from facts and should not become durable athlete truths after one occurrence.

A useful future lifecycle is:

```text
possible pattern -> repeated pattern -> established coaching context
```

## Progress experience

The default progress experience should answer **How am I doing?**, not merely display a large analytics dashboard.

Useful progress views may combine:

- goal trajectory;
- recent consistency/adherence;
- key strength progressions;
- running/cycling progression;
- selected body/athlete metric trends;
- meaningful records and milestones;
- the trainer's current interpretation.

Progress is athlete-specific. The app must not assume that body weight or any particular metric matters to every athlete.

## Plan versus reality

Coach should recognise meaningful distinctions including:

- completed as planned;
- completed with adaptation;
- partially completed;
- moved;
- deliberately skipped;
- missed.

The product should avoid punitive streak mechanics or simplistic failure states. Adaptation can be intelligent coaching behaviour.

## Weekly review

Before building a new week, Coach should be able to reconcile the previous week's planned and actual training, recent metrics, feedback and goal trajectory into a compact coaching context.

The user should not need to reconstruct the previous week manually before the trainer can plan the next one.

## Data-source principle

Coach's own source-neutral athlete ledger is the durable coaching state.

Workout evidence may eventually arrive through direct app entry, athlete conversation, Apple Health, a native Coach/Apple Watch client, a permitted Strava route or future hardware integrations. The source should be preserved, but no external fitness platform should become the canonical programme or coaching memory.

## Product boundaries and restraint

Coach is a personal-training product rather than an everything-health platform.

Nutrition/food logging, social fitness, generic wellness scoring and broad medical functionality are outside the core product unless later evidence establishes a specific training need.

Temporary injury/limitation/readiness information may influence training context, but Coach should not become a diagnostic or medical-management system.

## Core product principle

**The harness supports the coach rather than replacing the coaching relationship with forms and dashboards.**

Conversation should remain fluid: the athlete can ask for today's session, change a week, report an unexpected result, question the programme rationale or ask what recent training means. Structured product state exists so those conversations become progressively better informed rather than progressively more administrative.
