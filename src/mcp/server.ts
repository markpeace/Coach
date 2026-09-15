import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { z, ZodError } from "zod";
import { executeOperation } from "@/domain/service";
import { DomainError } from "@/domain/invariants";
import { isoDate, operationSchema, uuid } from "@/domain/contracts";

const READ_OPERATIONS=new Set(["listAthletes","getAthleteContext","getPlanningContext","getPlan","getToday","getExerciseHistory","getProgress"]);
const writeOperationSchema=operationSchema.refine(op=>!READ_OPERATIONS.has(op.operation),{message:"Use a Coach read tool for read-only operations."});

function jsonSafe(value:unknown){return JSON.parse(JSON.stringify(value)) as unknown}
function result(data:unknown){
 const safe=jsonSafe(data);
 return {content:[{type:"text" as const,text:JSON.stringify({ok:true,data:safe})}],structuredContent:{ok:true,data:safe}};
}
function failed(error:unknown){
 if(error instanceof ZodError){
  const body={ok:false,error:{code:"VALIDATION",message:"Request validation failed",details:error.issues}};
  return {content:[{type:"text" as const,text:JSON.stringify(body)}],structuredContent:body,isError:true};
 }
 if(error instanceof DomainError){
  const body={ok:false,error:{code:error.code,message:error.message,details:error.details}};
  return {content:[{type:"text" as const,text:JSON.stringify(body)}],structuredContent:jsonSafe(body) as Record<string,unknown>,isError:true};
 }
 const body={ok:false,error:{code:"DATABASE",message:"The operation could not be completed"}};
 return {content:[{type:"text" as const,text:JSON.stringify(body)}],structuredContent:body,isError:true};
}
async function call(input:unknown){try{return result(await executeOperation(input))}catch(error){return failed(error)}}

export function createCoachMcpHandler(){
 return createMcpHandler(()=>{
  const server=new McpServer({name:"Coach",version:"0.2.0",description:"Private persistent personal training coach backed by the Coach athlete ledger."});

  server.registerTool("coach_list_athletes",{description:"List active Coach household athletes. Use this before athlete-specific work when the active athlete is not already explicit.",inputSchema:z.object({}),annotations:{title:"List Coach athletes",readOnlyHint:true,openWorldHint:false}},async()=>call({operation:"listAthletes"}));
  server.registerTool("coach_get_athlete_context",{description:"Read durable context for one explicit athlete: persona, priorities, preferences, goals, events, locations/equipment and tracked metrics.",inputSchema:z.object({athleteId:uuid}),annotations:{title:"Read athlete context",readOnlyHint:true,openWorldHint:false}},async({athleteId})=>call({operation:"getAthleteContext",athleteId}));
  server.registerTool("coach_get_planning_context",{description:"Read the compact context needed to plan an explicit athlete's week, including foundation, weekly constraints, recent actuals, metrics, prior review and active observations.",inputSchema:z.object({athleteId:uuid,weekStart:isoDate}),annotations:{title:"Read planning context",readOnlyHint:true,openWorldHint:false}},async(args)=>call({operation:"getPlanningContext",...args}));
  server.registerTool("coach_get_plan",{description:"Read one athlete-scoped plan and its version history/workouts. Supply planId when known or weekStart to locate a week.",inputSchema:z.object({athleteId:uuid,planId:uuid.optional(),weekStart:isoDate.optional()}),annotations:{title:"Read Coach plan",readOnlyHint:true,openWorldHint:false}},async(args)=>call({operation:"getPlan",...args}));
  server.registerTool("coach_get_today",{description:"Read the effective planned session and any workout state for one explicit athlete and date.",inputSchema:z.object({athleteId:uuid,date:isoDate}),annotations:{title:"Read today's Coach session",readOnlyHint:true,openWorldHint:false}},async(args)=>call({operation:"getToday",...args}));
  server.registerTool("coach_get_exercise_history",{description:"Read actual historical sets for an exercise within one explicit athlete scope. History is based on actuals, not prescriptions.",inputSchema:z.object({athleteId:uuid,exerciseName:z.string().min(1).max(120)}),annotations:{title:"Read exercise history",readOnlyHint:true,openWorldHint:false}},async(args)=>call({operation:"getExerciseHistory",...args}));
  server.registerTool("coach_get_progress",{description:"Read factual planned-versus-actual, modality history, metrics, goals/events, reviews and observations for one athlete and period.",inputSchema:z.object({athleteId:uuid,periodStart:isoDate,periodEnd:isoDate}),annotations:{title:"Read Coach progress",readOnlyHint:true,openWorldHint:false}},async(args)=>call({operation:"getProgress",...args}));
  server.registerTool("coach_write",{description:"Perform one validated Coach write operation using the existing athlete-scoped domain contract. Always use the explicit active athleteId for athlete-specific writes. Preserve expectedVersion values from the latest read. Every write requires an idempotencyKey; reuse a key only for an exact retry, otherwise generate a new key. Lock/adapt operations must only follow explicit athlete acceptance.",inputSchema:writeOperationSchema,annotations:{title:"Update Coach state",readOnlyHint:false,destructiveHint:true,idempotentHint:true,openWorldHint:false}},async(op)=>call(op));
  return server;
 });
}
