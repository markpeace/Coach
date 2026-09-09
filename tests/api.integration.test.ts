import { describe, expect, it, vi } from "vitest";
import { operationSchema } from "@/domain/contracts";

const mocks=vi.hoisted(()=>({household:true,actionKey:false,execute:vi.fn(async(input:unknown)=>operationSchema.parse(input))}));
vi.mock("@/lib/auth",()=>({hasHouseholdSession:async()=>mocks.household,isValidActionKey:()=>mocks.actionKey}));
vi.mock("@/domain/service",()=>({executeOperation:mocks.execute}));
const { POST }=await import("@/app/api/v1/action/route");

describe("bounded Action API",()=>{
 it("denies calls without household session or Action key",async()=>{mocks.household=false;mocks.actionKey=false;const response=await POST(new Request("http://coach/api/v1/action",{method:"POST",body:JSON.stringify({operation:"listAthletes"})}));expect(response.status).toBe(401);mocks.household=true});
 it("accepts a valid household request through the shared operation contract",async()=>{const response=await POST(new Request("http://coach/api/v1/action",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({operation:"listAthletes"})}));expect(response.status).toBe(200);expect((await response.json()).data.operation).toBe("listAthletes")});
 it("accepts separate service authentication",async()=>{mocks.household=false;mocks.actionKey=true;const response=await POST(new Request("http://coach/api/v1/action",{method:"POST",headers:{authorization:"Bearer test"},body:JSON.stringify({operation:"listAthletes"})}));expect(response.status).toBe(200);mocks.household=true;mocks.actionKey=false});
 it("returns structured validation errors",async()=>{const response=await POST(new Request("http://coach/api/v1/action",{method:"POST",body:JSON.stringify({operation:"getProgress"})}));const body=await response.json();expect(response.status).toBe(400);expect(body).toMatchObject({ok:false,error:{code:"VALIDATION"}})});
});
