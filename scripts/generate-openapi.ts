import { z } from "zod";
import { operationSchema } from "../src/domain/contracts";
import { writeFile } from "node:fs/promises";

const inputSchema=z.toJSONSchema(operationSchema,{target:"draft-7",unrepresentable:"any"});
const document={openapi:"3.1.0",info:{title:"Coach Action API",version:"0.1.0",description:"Bounded, athlete-scoped operations over Coach's durable ledger."},servers:[{url:process.env.COACH_ACTION_SERVER??"https://coach-preview.example.invalid"}],paths:{"/api/v1/action":{post:{operationId:"coachOperation",summary:"Perform one bounded Coach task",security:[{bearerAuth:[]}],requestBody:{required:true,content:{"application/json":{schema:inputSchema}}},responses:{"200":{description:"Successful operation",content:{"application/json":{schema:{type:"object",required:["ok","data"],properties:{ok:{const:true},data:{}}}}}},"400":{description:"Validation failure"},"401":{description:"Authentication failure"},"404":{description:"Athlete-scoped object not found"},"409":{description:"Stale state or idempotency conflict"},"500":{description:"Database/runtime failure"}}}}},components:{securitySchemes:{bearerAuth:{type:"http",scheme:"bearer"}}}};
await writeFile("gpt/openapi.json",JSON.stringify(document,null,2)+"\n");
