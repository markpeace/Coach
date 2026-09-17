import { describe, expect, it } from "vitest";
import { operationSchema } from "@/domain/contracts";

const athleteId="00000000-0000-4000-8000-000000000001";
const planId="00000000-0000-4000-8000-000000000002";

describe("decision trace contract",()=>{
 it("accepts a concise material-decision trace",()=>{
  const parsed=operationSchema.parse({
   operation:"recordDecisionTrace",
   athleteId,
   idempotencyKey:"trace-plan-create-1",
   trace:{
    decisionType:"plan_created",
    userIntentSummary:"Plan next week around three available training windows",
    decisionSummary:"Create a three-session strength/run/cycle week",
    rationaleSummary:"Prioritises strength while preserving two aerobic exposures within the stated availability.",
    evidenceRefs:[{type:"athlete_context",id:"goal-strength",role:"primary goal"}],
    outputRefs:[{type:"plan",id:planId,version:1}],
    runtimeMetadata:{coachSkillVersion:"0.2.0",sourceSurface:"chatgpt"},
   },
  });
  expect(parsed.operation).toBe("recordDecisionTrace");
  if(parsed.operation!=="recordDecisionTrace")throw new Error("unexpected operation");
  expect(parsed.trace.outputRefs[0]).toMatchObject({type:"plan",id:planId,version:1});
 });

 it("rejects unsupported decision types and overlong summaries",()=>{
  expect(()=>operationSchema.parse({
   operation:"recordDecisionTrace",athleteId,idempotencyKey:"trace-invalid-1",
   trace:{decisionType:"secret_reasoning",decisionSummary:"x",rationaleSummary:"y"},
  })).toThrow();
  expect(()=>operationSchema.parse({
   operation:"recordDecisionTrace",athleteId,idempotencyKey:"trace-invalid-2",
   trace:{decisionType:"review",decisionSummary:"x".repeat(801),rationaleSummary:"y"},
  })).toThrow();
 });

 it("allows interaction identity to be omitted so the server can generate it",()=>{
  const parsed=operationSchema.parse({
   operation:"recordDecisionTrace",athleteId,idempotencyKey:"trace-server-id-1",
   trace:{decisionType:"observation",decisionSummary:"Retain a useful coaching observation",rationaleSummary:"Repeated evidence makes it relevant to future planning."},
  });
  expect("interactionId" in parsed ? parsed.interactionId : undefined).toBeUndefined();
 });
});
