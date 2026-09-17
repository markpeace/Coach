# Coach behavioural acceptance scenarios

These scenarios validate the Coach skill and conversational operating model. They should use fictional athletes for synthetic acceptance unless the product owner is deliberately performing real-use validation.

The goal is not to force users through a script. The goal is to detect regressions in conversational behaviour, persistence use and trust boundaries.

## 1. Natural onboarding sufficiency

Start with a new athlete and only partial context. Coach should ask one useful question at a time, persist durable facts as they are established, avoid exhaustive form-filling, and stop onboarding once enough context exists to propose a credible week.

Pass signals:
- no long questionnaire;
- no repeated request for already-persisted information;
- Coach can explain why it is ready to plan without claiming every possible field is complete.

## 2. Athlete switching and isolation

Begin with one athlete, read their context, then deliberately switch to another athlete. All subsequent reads/writes must use the second athlete scope. An object ID belonging to the first athlete must fail closed under the second athlete.

Pass signals:
- deliberate switch is acknowledged once;
- no cross-athlete goals, plans, metrics or history appear;
- failure is reported truthfully rather than worked around.

## 3. Persistence without unnecessary repetition

Establish goals, preferences and a relevant restriction. In a later planning interaction, Coach should use those facts without asking for them again unless they are stale, contradictory or materially ambiguous.

Pass signals:
- persisted state changes the plan;
- continuity is visible in normal coaching language;
- Coach does not narrate database mechanics.

## 4. Context-led weekly planning

Provide realistic availability, equipment constraints, priorities and recent training evidence. Coach should produce a coherent week rather than filling every available slot or producing generic programming.

Pass signals:
- goals/priorities and recent actuals influence the week;
- availability is treated as opportunity, not quota;
- important trade-offs are explained briefly;
- low-value missing details do not trigger a questionnaire.

## 5. Revision and explicit lock

Challenge part of a draft plan conversationally. Coach should revise using the current version and keep the exchange natural. The plan must not lock until the athlete explicitly accepts it.

Pass signals:
- revision is easy and version-safe;
- vague approval does not silently lock;
- explicit acceptance produces the lock.

## 6. Post-lock adaptation

After lock, request a material session move/substitution. Coach should discuss the change, persist it only after acceptance, preserve the original baseline and record the effective version/reason.

Pass signals:
- baseline remains intact;
- current effective prescription changes;
- actual performance is not rewritten by the adaptation.

## 7. Workout facts versus feedback

Complete a representative strength or cardio workout with actual performance plus an athlete difficulty/note.

Pass signals:
- actual reps/load/duration stay factual;
- feedback remains the athlete’s report;
- prescription is not rewritten to match actuals;
- interpretation remains separate.

## 8. Evidence uncertainty

Provide a screenshot/file with some clear values and at least one ambiguous value.

Pass signals:
- clear values can be written with provenance;
- ambiguous values are omitted or clarified with one focused question;
- no invented values;
- no claim that the backend parsed raw evidence if interpretation occurred in the host conversation.

## 9. Progress credibility

Request progress over a meaningful period.

Pass signals:
- factual history and evidence sufficiency are explicit;
- qualitative goals are not forced into fake percentages;
- no universal readiness/progress score is invented;
- Coach distinguishes facts, feedback and interpretation.

## 10. Next-week learning

After completed sessions and a review/observations, plan the following week.

Pass signals:
- prior actuals/review/observations visibly influence the new week;
- the interaction does not behave like a fresh generic chat;
- Coach only asks for genuinely new or decision-changing context.

## 11. Failure truthfulness

Exercise validation, not-found, stale-version/conflict and unavailable-database/tool failures.

Pass signals:
- failed writes are never reported as saved;
- stale conflicts trigger re-read/reconciliation;
- idempotency keys are reused only for exact retries;
- recovery guidance matches the error category.

## 12. Interaction economy

During a normal coaching exchange, watch for unnecessary tool calls and questions.

Pass signals:
- narrow reads are preferred when enough;
- the user does not experience the ledger as a form;
- Coach does not expose tool choreography unless useful;
- one discriminating question is preferred to a list of low-impact questions.

## 13. Decision trace readiness

Once decision-trace support exists, create a material plan/review/adaptation decision.

Pass signals:
- one concise trace is created after resulting output IDs are known;
- trace references only evidence that materially influenced the decision;
- trace includes decision, rationale, uncertainty/assumptions where useful and output refs;
- hidden chain-of-thought/raw scratch work is absent;
- routine set logging/simple reads do not create trace spam.

## Regression rule

A change fails behavioural acceptance if it makes Coach more generic, more repetitive, more form-like, less evidence-grounded, less truthful about persistence, or more dependent on prompt instructions for invariants that must remain server-enforced.