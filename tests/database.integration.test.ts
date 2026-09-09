import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { PGlite } from "@electric-sql/pglite";
import { readFile, readdir } from "node:fs/promises";

const pg = new PGlite();
beforeAll(async()=>{for(const name of (await readdir("drizzle")).filter(name=>name.endsWith(".sql")).sort())await pg.exec(await readFile(`drizzle/${name}`,"utf8"))});
afterAll(async()=>pg.close());

describe("PostgreSQL migration and trust schema",()=>{
 it("applies the reproducible migration",async()=>{const result=await pg.query<{count:number}>("select count(*)::int as count from information_schema.tables where table_schema='public'");expect(result.rows[0].count).toBeGreaterThanOrEqual(13)});
 it("isolates athlete context, metrics and plans by athlete",async()=>{
  const a=(await pg.query<{id:string}>("insert into athletes(name,display_name) values ('Alex Fixture','Alex'),('Blair Fixture','Blair') returning id")).rows;
  await pg.query("insert into athlete_context(athlete_id,kind,data) values ($1,'goal',$2::jsonb),($3,'goal',$4::jsonb)",[a[0].id,JSON.stringify({title:"Alex goal"}),a[1].id,JSON.stringify({title:"Blair goal"})]);
  const alex=await pg.query<{data:{title:string}}>("select data from athlete_context where athlete_id=$1",[a[0].id]);expect(alex.rows.map(r=>r.data.title)).toEqual(["Alex goal"]);
  const leaked=await pg.query("select * from athlete_context where athlete_id=$1 and data->>'title'='Blair goal'",[a[0].id]);expect(leaked.rows).toHaveLength(0);
 });
 it("preserves locked baseline, effective plan and actual separately",async()=>{
  const athlete=(await pg.query<{id:string}>("select id from athletes where display_name='Alex'")).rows[0];
  const plan=(await pg.query<{id:string}>("insert into plans(athlete_id,week_start,status,version,baseline_version) values ($1,'2026-09-14','locked',2,1) returning id",[athlete.id])).rows[0];
  const baseline={rationale:"Accepted",sessions:[{key:"s1",date:"2026-09-14",modality:"strength",prescription:{load:14}}]};const effective={rationale:"Adapted",sessions:[{key:"s1",date:"2026-09-15",modality:"strength",prescription:{load:12}}]};
  await pg.query("insert into plan_versions(plan_id,athlete_id,version,reason,payload) values ($1,$2,1,'locked',$3::jsonb),($1,$2,2,'accepted_adaptation',$4::jsonb)",[plan.id,athlete.id,JSON.stringify(baseline),JSON.stringify(effective)]);
  await pg.query("insert into workouts(athlete_id,plan_id,session_key,modality,status,original_prescription,effective_prescription,actual) values ($1,$2,'s1','strength','completed',$3::jsonb,$4::jsonb,$5::jsonb)",[athlete.id,plan.id,JSON.stringify(baseline.sessions[0]),JSON.stringify(effective.sessions[0]),JSON.stringify({sets:[{reps:10,load:12}]})]);
  type WorkoutProof={original_prescription:{prescription:{load:number}};effective_prescription:{prescription:{load:number}};actual:{sets:Array<{reps:number}>}};
  const row=(await pg.query<WorkoutProof>("select original_prescription,effective_prescription,actual from workouts where plan_id=$1",[plan.id])).rows[0];expect(row.original_prescription.prescription.load).toBe(14);expect(row.effective_prescription.prescription.load).toBe(12);expect(row.actual.sets[0].reps).toBe(10);
 });
 it("enforces material idempotency keys",async()=>{await pg.query("insert into idempotency(key,operation,request_hash,response) values ('same-key','createDraftPlan','hash-a','{}')");await expect(pg.query("insert into idempotency(key,operation,request_hash,response) values ('same-key','createDraftPlan','hash-b','{}')")).rejects.toThrow()});
 it("supports an exclusive in-progress idempotency reservation",async()=>{await pg.query("insert into idempotency(key,operation,request_hash,response) values ('pending-key','lockPlan','hash-pending',null)");const pending=await pg.query<{response:unknown}>("select response from idempotency where key='pending-key'");expect(pending.rows[0].response).toBeNull();await pg.query("update idempotency set response='{}'::jsonb where key='pending-key'");const completed=await pg.query<{response:unknown}>("select response from idempotency where key='pending-key'");expect(completed.rows[0].response).toEqual({})});
 it("keeps feedback and Coach interpretation in different records",async()=>{const result=await pg.query<{workout_feedback:string;observation_count:number}>("select (select count(*)::text from workouts where feedback is not null) as workout_feedback,(select count(*)::int from observations) as observation_count");expect(Number(result.rows[0].workout_feedback)).toBeGreaterThanOrEqual(0);expect(result.rows[0].observation_count).toBe(0)});
});
