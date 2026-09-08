# Coach MVP definition

Status: Draft

## Purpose

Define the smallest coherent Coach experience that can test whether a persistent AI personal trainer is materially more useful than an ordinary ChatGPT coaching conversation because it reliably carries goals, plans, performance and progress across time.

This is a first design baseline, not yet a frozen implementation scope.

## Primary user

An athlete who already values conversational AI coaching but currently has to repeatedly provide context about goals, recent training, previous performance, availability and metrics.

The first product may serve a small known set of athletes, but athlete separation must be real from the beginning rather than simulated with one shared profile.

## MVP learning question

**Does a durable athlete ledger plus conversational weekly planning and workout execution make Coach useful enough that athletes choose to use it as their ongoing personal trainer rather than repeatedly reconstructing context in ordinary ChatGPT conversations?**

## Product-owner outcome

A real athlete can complete the following loop through ordinary use:

1. establish athlete identity and coaching preferences;
2. maintain training priorities and meaningful goals;
3. describe the coming week's real availability;
4. collaboratively generate, tweak and lock a weekly plan;
5. browse that plan day by day in the app;
6. start a planned workout;
7. record useful exercise/session actuals while training;
8. add qualitative feedback conversationally or through lightweight app input;
9. record selected athlete metrics;
10. inspect understandable progress;
11. return to the GPT and receive coaching grounded in the accumulated ledger;
12. use that evidence to create the next week.

## Hero journey: weekly planning

A likely primary ritual is a weekend planning conversation.

Example:

> `I've got an hour Monday at the gym, 30 minutes at home Tuesday, nothing Wednesday, Thursday morning is good, and I can run at the weekend. Plan next week.`

Coach should already know the active athlete's goals, priorities, locations/equipment, recent training and relevant metrics.

It proposes a coherent week, explains important choices where useful, accepts conversational revisions and only makes the plan the agreed baseline when the athlete explicitly locks/accepts it.

The app then exposes the agreed week clearly without requiring the athlete to reconstruct it from chat.

## Hero journey: execute today's workout

From Today or the relevant planned session, the athlete can start the workout and see the actual prescription and useful guidance.

For strength this may include:

- exercise;
- sets/reps;
- load;
- rest;
- previous relevant performance or progression cue where useful;
- set-level actual recording.

For running this may include:

- duration/distance;
- intensity/zone/pace guidance;
- intervals or strides where prescribed;
- short coaching cues.

For cycling this may include:

- named Zwift workout where appropriate;
- duration;
- intensity/power guidance where known;
- short coaching cues.

The execution UI should favour fast recording over administrative completeness.

## Hero journey: report what happened

The athlete can record actuals directly in the app and can also talk to Coach about the session.

Example:

> `I did the bench but 16kg was rough. I got 10, 9, 8 and the last set was basically failure.`

Coach should be able to associate that feedback with the relevant completed session and preserve the useful factual/qualitative distinction.

## Hero journey: understand progress

The app should provide an encouraging, athlete-specific progress surface answering **How am I doing?**

The first version should support a small useful set of views rather than an analytics warehouse, likely including:

- active goals and current trajectory/assessment;
- recent planned-versus-actual training;
- key exercise/performance progression;
- selected athlete metric trends;
- meaningful recent milestones/records where available;
- a concise current coach interpretation.

## Candidate app information architecture

### Today

The immediate training focus: today's planned session, status, start/resume action and relevant guidance.

### Plan

Week-based plan navigation with draft/locked distinction, day-by-day sessions and visible adaptations.

### Progress

Goal trajectory, selected performance/metric trends and coaching interpretation.

### Athlete

Identity, coach persona, training priorities, goals/events, locations/equipment and metric entry/history.

This information architecture is provisional and should be challenged against real-use flows before implementation.

## Core MVP domain capabilities

### Athlete identity

- distinct athlete records;
- explicit active-athlete selection/establishment for GPT operations;
- hard read/write isolation between athletes;
- athlete-specific coach name/persona.

### Training intent

- training priorities;
- specific goals;
- optional target dates;
- dated race/event where relevant;
- progress measures and current coaching assessment.

### Locations and equipment

- named reusable locations;
- equipment available at each location;
- lightweight temporary/travel location support or equivalent bounded context.

### Availability

- weekly/day availability;
- duration/window;
- location;
- planning context necessary to produce a realistic prescription.

### Weekly plans

- draft plan;
- conversational revision;
- explicit lock/accept;
- day/session structure;
- adaptation after lock without destroying baseline history.

### Workout prescriptions

- modality-aware sessions;
- structured strength exercises/sets/reps/load/rest;
- useful run prescription structure;
- useful cycling/Zwift prescription structure;
- coaching notes/tips.

### Workout actuals

- start/in-progress/completion state;
- strength set-level actuals where relevant;
- session-level actual/result details for run/cycle/manual activities;
- adapted/partial/moved/skipped distinctions where useful;
- qualitative feedback.

### Metrics

- generic time-series athlete metrics;
- manual/direct entry in MVP;
- visual trend for selected metrics;
- source/provenance field so later automatic ingestion does not require a redesign.

### Coaching observations

- bounded athlete-specific observations/hypotheses;
- clear distinction from trusted facts;
- enough evidence/provenance to avoid silent overgeneralisation.

## GPT responsibilities in MVP

The Custom GPT should:

- establish the active athlete when ambiguous;
- interpret conversational availability and training feedback;
- propose weekly programming based on current athlete state;
- explain important programme choices;
- adapt sessions/weeks conversationally within explicit write boundaries;
- interpret actual performance and metric trends;
- make qualitative progression judgements;
- recommend substitutions that preserve training intent when circumstances change;
- express the athlete-specific trainer persona.

The GPT must not:

- infer authority from conversational identity alone;
- invent athlete history when state is unavailable;
- claim a plan/workout/metric write succeeded without an Action result;
- silently overwrite a locked baseline plan;
- turn one qualitative comment into an established athlete trait;
- persist hidden reasoning as athlete state.

## Harness responsibilities in MVP

Product code should own:

- athlete identity/authorisation boundaries;
- goals/priorities/event records;
- locations and equipment;
- availability facts;
- plan versions/lifecycle;
- workout prescriptions and actuals;
- metrics;
- source/provenance;
- validation and idempotency;
- state/history needed for planned-versus-actual comparison;
- deterministic progress calculations that should not depend on GPT arithmetic;
- bounded Action contracts;
- app inspection/direct-edit surfaces.

## Explicit MVP exclusions

Unless later promoted through a deliberate scope decision, the first MVP does **not** require:

- Apple Health / HealthKit automatic ingestion;
- Health Auto Export integration;
- Strava ingestion;
- native iPhone app;
- Apple Watch app;
- live heart-rate/sensor capture;
- WorkoutKit integration;
- Web Bluetooth;
- FTMS smart-trainer telemetry/control;
- calendar integration;
- nutrition or calorie/macronutrient tracking;
- social/community features;
- public marketplace/onboarding/commercial subscription flows;
- broad medical or diagnostic functionality;
- complex recovery/readiness scoring.

## MVP quality bar

The product needs enough quality that feedback is about the coaching model rather than obvious incompleteness.

In particular:

- athlete identity must be trustworthy;
- plan state must remain coherent between GPT and app;
- actuals must not disappear or silently overwrite prescriptions;
- locked-plan adaptations must remain intelligible;
- workout logging must be fast enough to use during a real session;
- progress should feel useful and encouraging rather than mechanically gamified;
- the GPT should be able to answer common coaching questions without requiring the athlete to restate durable context.

## Candidate validation questions

After real use, ask:

1. Does the weekly planning conversation require materially less context-setting than ordinary ChatGPT?
2. Does the generated week fit real availability and equipment well enough to trust?
3. Is the app genuinely useful during a workout, or easier to ignore?
4. Does recording actuals feel proportionate to the coaching value returned?
5. Does qualitative feedback meaningfully change later advice without causing overreaction?
6. Can the athlete see progress in a way that feels motivating and credible?
7. Does the trainer make noticeably better decisions because it remembers previous sessions and metrics?
8. Are athlete identity boundaries trusted in shared-GPT use?
9. Which structured fields create admin without improving coaching?
10. Would the athlete voluntarily use Coach to plan the following week?

## Exit from MVP validation

The MVP should move into consolidation when at least one real training cycle has demonstrated whether the persistent coaching loop creates enough value to continue, and material trust/usability/product-model findings have been classified and reflected in the next roadmap decision.
