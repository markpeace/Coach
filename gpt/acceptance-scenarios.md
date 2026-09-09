# Coach Custom GPT acceptance scenarios

Package version: 0.1.0

Each write must be confirmed by an `ok: true` Action response. Use fictional athletes only during synthetic acceptance.

1. **Athlete selection and switching:** List two athletes, select Alex, read Alex’s context, switch deliberately to Blair, and read Blair’s context. Verify no Alex goal, metric, plan or history appears in Blair’s payload. Attempt an Alex object ID under Blair scope and expect `NOT_FOUND` or `CONFLICT`.
2. **Athlete foundation:** For Alex, save Coach Rowan’s persona, strength as Primary, running as Develop, an explicit weekend preference, a numeric 5K goal, a qualitative upper-body physique goal, a dated race, Home and Gym equipment profiles, and a metric reading. Read the context and verify fact, interpretation and provenance labels remain distinct.
3. **Weekly context:** Add mixed availability, a fixed social-run anchor and a time-bounded travel/equipment limitation. Read the requested week. Verify the limitation is absent outside its effective dates and Coach does not fill every available slot automatically.
4. **Plan draft, revision and lock:** Read planning context, create a structured strength/run/cycle draft, show it, revise after athlete feedback, and lock only after explicit acceptance. Verify the locked baseline version and all modality prescriptions.
5. **Stale and retry behaviour:** Repeat an identical write with the same idempotency key and verify no duplicate. Change the payload under that key and expect `CONFLICT`. Attempt a revision with an old version and expect `CONFLICT`.
6. **Post-lock adaptation:** Move or substitute a session after explicit acceptance. Verify baseline payload/version remains unchanged while current effective version changes and the reason is visible.
7. **Strength execution:** Start a strength workout, log several sets, re-read/resume it, change reps/load from prescription, then complete with difficulty feedback. Verify original, effective and actual set data remain distinct and previous-performance history uses actuals.
8. **Run and cycle actuals:** Complete representative run and cycling sessions with minimal fields, then with optional distance/pace/HR or power. Verify unknown fields stay absent and partial/skipped/missed outcomes remain representable.
9. **Athlete-provided evidence:** Inspect a fictional screenshot or supported file in ChatGPT, write only visible structured facts with `athlete_evidence` provenance and a field list. For an ambiguous or unsupported file, omit uncertain values or ask a focused question. Verify no backend parsing claim and no raw evidence retention.
10. **Facts, feedback and interpretation:** Record a factual workout adaptation, athlete difficulty/note and concise evidence-linked Coach observation. Read them back and verify each occupies its own labelled state.
11. **Progress review:** Read a four-week progress context. Explain planned-versus-actual, relevant modality history and selected metrics without a synthetic score. Create a concise goal-assessed review with evidence references.
12. **Next-week reasoning:** Read the following week’s planning context. Verify the prior factual summary, current review and active observations are present, then explain which prior evidence affects the new week.
13. **Failures:** Exercise missing athlete scope, invalid units/types, unknown athlete/object, closed-workout mutation, stale version, invalid bearer key and unavailable database/tool paths. Never report a failed write as saved.
