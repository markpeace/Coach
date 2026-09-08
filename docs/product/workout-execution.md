# Coach workout execution

Status: Current

## Purpose

Define the MVP workout-execution model that turns a planned session into reliable athlete evidence without making Coach burdensome to use during training.

## Core execution loop

```text
Today
  ↓
start planned workout
  ↓
see prescription and relevant progression context
  ↓
record what actually happens
  ↓
adapt where necessary
  ↓
complete
  ↓
brief feedback
  ↓
ledger updated
```

## Prescription, effective session and actual

Coach must preserve three distinct layers:

1. **Prescription**: the originally agreed planned work.
2. **Effective session**: any accepted changes made before or during execution.
3. **Actual**: what the athlete really completed.

An adaptation must not erase the original prescription, and actuals must not silently overwrite either layer.

Example:

```text
Prescription
DB bench 3 x 10 @ 16kg

Effective session
No change

Actual
10 / 10 / 9 @ 16kg
```

Or:

```text
Prescription
Barbell squat

Effective session
Leg press substituted because rack unavailable

Actual
3 x 12 @ 135kg
```

This distinction is required for trustworthy progression and planned-versus-actual review.

## Shared session lifecycle

Keep the core lifecycle small:

```text
planned -> in_progress -> completed
```

Completion/outcome attributes should support meaningful distinctions such as:

- completed as planned;
- completed adapted;
- partial;
- deliberately skipped;
- missed.

Moving a session belongs to plan adaptation rather than workout outcome.

## Strength execution

Strength is the richest MVP execution mode because set-level actuals materially improve later programming.

An exercise execution view should be able to show:

- exercise name;
- prescribed sets/reps/load;
- prescribed rest;
- short coaching cue;
- relevant previous performance/progression cue where useful;
- fast set-level actual entry.

Example:

```text
Dumbbell bench press
3 x 8-10 @ 16kg
Rest 2:00

Last time: 10 / 10 / 9 @ 16kg
Today: aim to get all three sets to 10
```

The athlete must be able to alter reps/load quickly when reality differs from the prescription.

### Rest timer

Include a simple optional rest timer in MVP. Completing a set may start the prescribed countdown. The timer should remain a convenience, not a complex training feature.

## Exercise identity

Coach needs stable exercise identity so historical progression remains queryable.

An exercise record should support at least:

- stable identifier;
- canonical name;
- useful aliases;
- category/modality;
- optional equipment association;
- athlete-specific execution history.

Custom exercises should be possible. MVP does not require a large exercise encyclopaedia or media library.

## Running execution

Coach does not need to become a GPS tracker in MVP.

The app should present the planned run clearly, including useful prescription components such as:

- intended stimulus;
- duration and/or distance;
- pace/zone/effort guidance;
- intervals or strides where relevant;
- short rationale/cues.

Starting the workout may simply mark the session in progress and expose the prescription cleanly.

Manual actual entry may include:

- duration;
- distance;
- average HR where the athlete chooses to record it;
- pace where useful;
- completion/adaptation state;
- perceived difficulty;
- optional note.

The same actual may also be created conversationally when the athlete tells Coach what happened.

GPS, route capture and live heart-rate capture are explicitly outside MVP.

## Cycling execution

The same lightweight pattern applies to cycling.

A cycling prescription may include:

- intended stimulus;
- duration;
- intensity/power guidance;
- named Zwift workout where appropriate;
- short coaching cues.

Manual actuals may include completion, duration, power/heart-rate fields where useful, perceived difficulty and notes.

Coach does not execute or control Zwift/smart-trainer workouts in MVP.

## Adaptation during execution

The athlete must be able to adapt when reality changes, for example equipment is unavailable or a prescribed load is inappropriate on the day.

Conversation is the preferred MVP surface for non-trivial substitutions:

- Coach reads the active session and relevant location/equipment context;
- Coach proposes a substitute preserving the intended stimulus;
- when accepted, the effective session is updated;
- the original prescription remains preserved.

The app may expose simple substitution/edit affordances, but MVP does not require a sophisticated automated substitution engine.

## Feedback model

Workout completion should require very little friction.

A useful lightweight structured prompt is:

- Easy;
- About right;
- Hard;
- Very hard.

The athlete may add an optional note or continue naturally in conversation.

Coach must distinguish:

### Athlete feedback

Subjective experience such as `last set felt close to failure`.

### Factual adaptation

What objectively changed, such as `used 14kg instead of 16kg`.

### Coach interpretation

A bounded hypothesis such as `possible accumulated upper-body fatigue`.

These should not collapse into one undifferentiated notes field.

## Today experience

Today should primarily answer **What am I doing?**

When a session exists, the athlete should see the current session, location/duration, concise coaching context and a prominent start/resume action before secondary metrics or analytics.

If a workout is in progress, Resume should be the dominant action.

## Conversational logging

The athlete can record actual performance through conversation as well as the app.

For example:

> I did the bench. 16kg was rough. I got 10, 9, 8 and the final set was basically failure.

Coach should use bounded operations to attach the factual actuals and qualitative feedback to the correct active session. It must not claim the ledger was updated unless the write succeeds.

## MVP boundary

### Build now

- modality-aware prescriptions;
- Today/start/resume flow;
- strength set-level logging;
- relevant previous-performance/progression context;
- simple optional rest timer;
- session lifecycle and outcome state;
- accepted adaptations/substitutions while preserving baseline;
- lightweight structured feedback;
- manual run/cycle actual entry;
- conversational actual/feedback logging.

### Defer

- GPS/route tracking;
- live heart-rate/sensor capture;
- Apple Health automatic ingestion;
- native Watch execution;
- WorkoutKit;
- smart-trainer telemetry/control;
- sophisticated exercise-video/library functionality.

## MVP learning focus

Real use should establish:

- whether Coach makes the workout easier to execute;
- whether logging is fast enough that athletes actually use it;
- whether prescription versus actual remains intelligible;
- whether later programming becomes better because actual history exists;
- which structured fields create friction without returning meaningful coaching value.

Fields that do not improve coaching should be removed aggressively rather than retained for completeness.
