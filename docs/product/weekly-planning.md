# Coach weekly planning

Status: Current

## Purpose

Define how Coach turns athlete goals, recent evidence, availability and temporary context into a realistic agreed training week.

## Core planning ritual

The primary planning interaction is conversational and should feel like working with a persistent trainer rather than filling in a programme form.

```text
active athlete
  + goals / priorities / events
  + recent actual training / metrics / feedback
  + temporary context
  + next-week availability / locations
        ↓
Coach proposes week
        ↓
conversation / revisions
        ↓
explicit athlete acceptance
        ↓
locked agreed plan
```

Coach should already know durable athlete context. The athlete should not need to repeatedly restate goals, previous training, available equipment or known progression history.

## Planning context read

Before proposing a week, Coach should receive a compact athlete-scoped planning context containing the smallest useful set of current evidence, including:

- active training priorities;
- active goals and relevant Coach assessments;
- upcoming events;
- recent actual training;
- recent planned-versus-actual outcomes;
- useful recent metrics;
- relevant feedback;
- bounded coaching observations;
- reusable locations and equipment;
- current training preferences where explicitly saved.

The previous week should be reconciled around what actually happened rather than merely what was prescribed.

## Availability

Weekly availability is structured product state but should be easy to provide conversationally.

An availability opportunity may include:

- date/day;
- approximate duration or time window;
- location;
- available equipment via that location;
- optional context.

Precise clock times should not be mandatory where the athlete only cares about day and duration.

Availability is opportunity, not quota. Coach may deliberately leave available slots unused when the programme does not justify additional training.

## Anchored commitments

Coach should distinguish ordinary availability from already-committed training anchors.

Examples include a planned social run, race, fixed class or other session the athlete intends to do regardless of the generated programme.

Anchored commitments should influence the rest of the week's design rather than being treated as just another free slot.

## Temporary planning context

Short-lived information that affects the week should be modelled with a relevant time window rather than as permanent athlete profile state.

Examples include:

- unusual soreness/fatigue;
- poor sleep;
- temporary movement or exercise restriction;
- travel;
- temporary equipment/location limitation;
- unusually high or low readiness;
- reduced available time.

This context should expire or cease to influence planning when it is no longer relevant.

## Programming principle

Coach should programme the athlete's week rather than mechanically fill the calendar.

Training choice should reflect:

- goal priorities;
- time until relevant events;
- recent actual training and progression;
- cumulative stress and session sequencing;
- locations/equipment;
- available time;
- temporary context;
- explicit athlete preferences.

The GPT owns the qualitative programming judgement. Product code should provide trusted facts, comparisons, plan state and boundaries rather than hard-code a universal progression algorithm.

## Progression evidence

Progression decisions should be grounded primarily in actual training evidence.

### Strength

Useful evidence may include load, reps, sets, completion, substitutions and athlete feedback.

### Running

Useful evidence may include duration, distance, intensity/pace/zone evidence, session completion and athlete feedback.

### Cycling

Useful evidence may include duration, prescribed workout completion, power/intensity evidence where available and athlete feedback.

Coach may decide to progress, maintain, reduce or alter training based on the combined evidence rather than applying deterministic automatic increases.

## Training blocks

A formal training-block object is not required for the first MVP.

Goals, events, priorities, recent history and current Coach assessment should be sufficient to test whether coherent weekly progression emerges through real use.

If validation shows that week-to-week programming becomes inconsistent or loses the longer arc, a first-class programme/block concept can be introduced later.

## Weekly plan

A weekly plan is an athlete-scoped first-class artefact with enough history to preserve the agreed baseline.

It should include at least:

- athlete;
- week/start date;
- lifecycle state;
- planning inputs/context references where useful;
- plan-level rationale;
- planned sessions;
- version/baseline history sufficient for planned-versus-actual comparison.

Likely lifecycle:

- draft;
- locked/agreed;
- in progress;
- completed or superseded.

## Session intent

Each planned session should contain an intended training stimulus in addition to modality and prescription.

Examples:

- upper-body hypertrophy, chest emphasis;
- easy aerobic run;
- threshold intervals;
- recovery-oriented cycling;
- lower-body strength maintenance.

Preserving intended stimulus makes later substitution and adaptation more intelligent because Coach can change the implementation while preserving the purpose of the session.

## Drafting and locking

The first generated week is a draft.

The athlete may revise it conversationally before acceptance. Coach should update the draft without treating the first proposal as a commitment.

An explicit bounded acceptance such as `lock it in` establishes the agreed baseline.

Locking is important both operationally and psychologically: it marks the point where planning becomes the athlete's intended week.

## Adaptation after lock

A locked plan is not immutable.

If circumstances change, Coach may propose an adaptation and write it once accepted through a bounded operation. Simple local changes can be handled conversationally; material multi-session restructuring should show the revised week before committing it.

The original locked baseline must remain recoverable. Adaptation must not erase what the athlete originally intended to do.

This enables later distinctions such as:

```text
originally planned: Thu strength / Sat easy run / Sun intervals
adapted: Thu unavailable / Sat intervals / Sun easy run
```

## Training preferences

Coach needs a lightweight athlete-specific preference layer distinct from goals and availability.

Examples include:

- prefers outdoor running to treadmill;
- likes one Zwift session most weeks;
- avoids two heavy gym days back-to-back where possible;
- prefers longer sessions at weekends.

Preferences should be explicitly saved rather than inferred as permanent truths from one conversational remark.

## App experience

The Plan surface should present the week clearly at a glance, with day-level session cards and visible draft/locked/adapted state.

A session card should expose the important summary:

- modality / title;
- intended stimulus;
- location;
- expected duration;
- key prescription summary.

Opening the session can reveal detailed prescription, rationale and coaching guidance.

The Today surface should derive today's immediate training focus from the same plan state rather than maintain a separate competing plan.

## Product boundary

Weekly planning should remain conversational and coach-led. The harness exists to preserve facts, state, history and coherence, not to force the athlete to administer a formal periodisation system.
