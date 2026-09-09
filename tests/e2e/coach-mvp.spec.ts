import { expect, test, type Page } from "@playwright/test";

const key=(name:string)=>`${name}:${crypto.randomUUID()}`;
async function op(page:Page,body:Record<string,unknown>){const response=await page.request.post("/api/v1/action",{data:body});const json=await response.json();expect(response.ok(),JSON.stringify(json)).toBeTruthy();return json.data}
async function login(page:Page){await page.goto("/login");await page.getByLabel("Household passphrase").fill(process.env.E2E_PASSPHRASE??"fictional-coach-test");await page.getByRole("button",{name:"Open Coach"}).click();await expect(page).toHaveURL(/\/today/)}

test("complete persistent coaching loop with explicit athlete isolation",async({page})=>{
 await login(page);
 const suffix=crypto.randomUUID().slice(0,6);
 const alex=await op(page,{operation:"createAthlete",name:`Alex Fixture ${suffix}`,displayName:`Alex ${suffix}`,timezone:"Europe/London",idempotencyKey:key("athlete")});
 const blair=await op(page,{operation:"createAthlete",name:`Blair Fixture ${suffix}`,displayName:`Blair ${suffix}`,timezone:"Europe/London",idempotencyKey:key("athlete")});
 await op(page,{operation:"upsertPersona",athleteId:alex.id,persona:{coachName:"Rowan",styleBrief:"Warm, direct and evidence-led",warmth:"high",explanation:"balanced",challenge:"balanced"},idempotencyKey:key("persona")});
 await op(page,{operation:"addContext",athleteId:alex.id,kind:"priority",data:{area:"Strength",level:"primary"},idempotencyKey:key("priority")});
 const numericGoal=await op(page,{operation:"addContext",athleteId:alex.id,kind:"goal",data:{title:"30 minute 5K",description:"Run 5K in 30 minutes without an all-out effort",type:"performance",status:"active",priority:"high",targetValue:30,targetUnit:"minutes",indicators:["5K result","easy pace"]},idempotencyKey:key("goal")});
 await op(page,{operation:"addContext",athleteId:alex.id,kind:"goal",data:{title:"Upper-body development",description:"Develop chest and upper body while maintaining lower-body strength",type:"physique",status:"active",priority:"high",qualitativeTarget:"Visible and measurable development",indicators:["pressing progression","training consistency"]},idempotencyKey:key("goal")});
 await op(page,{operation:"addContext",athleteId:alex.id,kind:"event",data:{name:"Autumn 5K",type:"race",date:"2026-09-19",linkedGoalIds:[numericGoal.id]},idempotencyKey:key("event")});
 const gym=await op(page,{operation:"addContext",athleteId:alex.id,kind:"location",data:{name:"Fixture Gym",kind:"gym",temporary:false,equipment:[{name:"Dumbbells",type:"free_weight",attributes:{maxKg:40,incrementKg:2}},{name:"Treadmill",type:"cardio",attributes:{}}]},idempotencyKey:key("location")});
 const metric=await op(page,{operation:"defineMetric",athleteId:alex.id,definition:{key:`resting_hr_${suffix}`,displayName:"Resting heart rate",unit:"bpm"},idempotencyKey:key("metric")});
 await op(page,{operation:"recordMetric",athleteId:alex.id,reading:{definitionId:metric.id,measuredAt:"2026-09-09T07:00:00.000Z",value:54,source:{kind:"manual",label:"Fictional fixture"}},idempotencyKey:key("reading")});
 const week="2026-09-14";
 await op(page,{operation:"setWeeklyContext",athleteId:alex.id,entry:{kind:"availability",weekStart:week,effectiveFrom:week,effectiveTo:week,data:{date:week,durationMinutes:50,locationId:gym.id}},idempotencyKey:key("availability")});
 await op(page,{operation:"setWeeklyContext",athleteId:alex.id,entry:{kind:"anchor",weekStart:week,effectiveFrom:"2026-09-16",effectiveTo:"2026-09-16",data:{date:"2026-09-16",durationMinutes:35,title:"Social run"}},idempotencyKey:key("anchor")});
 await op(page,{operation:"setWeeklyContext",athleteId:alex.id,entry:{kind:"temporary",weekStart:week,effectiveFrom:"2026-09-17",effectiveTo:"2026-09-18",data:{title:"Travel",note:"Hotel dumbbells only"}},idempotencyKey:key("temporary")});
 const planPayload={rationale:"Prioritise upper-body strength while developing comfortable running",sessions:[
  {key:"strength-mon",date:"2026-09-14",title:"Upper strength",intendedStimulus:"Upper-body hypertrophy, chest emphasis",durationMinutes:50,locationId:gym.id,coachCue:"Leave one clean rep in reserve",modality:"strength",prescription:{exercises:[{exerciseName:"Dumbbell bench press",sets:[{reps:10,load:14,unit:"kg",restSeconds:90},{reps:10,load:14,unit:"kg",restSeconds:90}]}]}},
  {key:"run-wed",date:"2026-09-16",title:"Easy social run",intendedStimulus:"Aerobic development",durationMinutes:35,modality:"run",prescription:{durationMinutes:35,intensity:"Easy conversational effort"}},
  {key:"cycle-sat",date:"2026-09-19",title:"Aerobic ride",intendedStimulus:"Low-impact aerobic volume",durationMinutes:40,modality:"cycle",prescription:{durationMinutes:40,intensity:"Zone 2",powerGuidance:"90-100 W",zwiftWorkout:"Coach Aerobic 40"}}
 ]};
 const draft=await op(page,{operation:"createDraftPlan",athleteId:alex.id,weekStart:week,plan:planPayload,idempotencyKey:key("draft")});
 const revisedPayload={...planPayload,rationale:"Revised after athlete asked to protect Friday recovery"};
 const revised=await op(page,{operation:"reviseDraftPlan",athleteId:alex.id,planId:draft.id,expectedVersion:1,plan:revisedPayload,idempotencyKey:key("revise")});
 const retryKey=key("lock");await op(page,{operation:"lockPlan",athleteId:alex.id,planId:draft.id,expectedVersion:revised.version,confirmation:"lock",idempotencyKey:retryKey});await op(page,{operation:"lockPlan",athleteId:alex.id,planId:draft.id,expectedVersion:revised.version,confirmation:"lock",idempotencyKey:retryKey});
 const adaptedPayload={...revisedPayload,sessions:revisedPayload.sessions.map(s=>s.key==="cycle-sat"?{...s,date:"2026-09-20"}:s)};
 const adapted=await op(page,{operation:"adaptPlan",athleteId:alex.id,planId:draft.id,expectedVersion:2,reason:"Saturday became unavailable",plan:adaptedPayload,accepted:true,idempotencyKey:key("adapt")});
 const strength=await op(page,{operation:"startWorkout",athleteId:alex.id,planId:draft.id,sessionKey:"strength-mon",expectedPlanVersion:adapted.version,idempotencyKey:key("start")});
 const set1=await op(page,{operation:"logSet",athleteId:alex.id,workoutId:strength.id,expectedVersion:strength.version,exerciseName:"Dumbbell bench press",setIndex:1,reps:10,load:14,unit:"kg",idempotencyKey:key("set")});
 await op(page,{operation:"logSet",athleteId:alex.id,workoutId:strength.id,expectedVersion:set1.workout.version,exerciseName:"Dumbbell bench press",setIndex:2,reps:9,load:14,unit:"kg",idempotencyKey:key("set")});
 const currentPlan=await op(page,{operation:"getPlan",athleteId:alex.id,planId:draft.id});const currentWorkout=currentPlan.workouts.find((w:{id:string})=>w.id===strength.id);
 await op(page,{operation:"completeWorkout",athleteId:alex.id,workoutId:strength.id,expectedVersion:currentWorkout.version,outcome:"completed",actual:{durationMinutes:48,source:{kind:"manual",label:"Fixture app"}},feedback:{difficulty:"about_right",note:"Last reps were challenging"},evidence:[],coachInterpretation:"Pressing load is appropriate for another exposure before progression.",idempotencyKey:key("complete")});
 for(const sessionKey of ["run-wed","cycle-sat"]){const started=await op(page,{operation:"startWorkout",athleteId:alex.id,planId:draft.id,sessionKey,expectedPlanVersion:adapted.version,idempotencyKey:key("start")});await op(page,{operation:"completeWorkout",athleteId:alex.id,workoutId:started.id,expectedVersion:started.version,outcome:"completed",actual:sessionKey.startsWith("run")?{durationMinutes:36,distanceKm:5,pace:"7:12/km",averageHeartRate:142,source:{kind:"athlete_evidence",label:"Fictional screenshot",confidence:"high"}}:{durationMinutes:40,averagePower:96,averageHeartRate:128,source:{kind:"conversation",label:"Athlete report"}},feedback:{difficulty:"about_right"},evidence:sessionKey.startsWith("run")?[{source:{kind:"athlete_evidence",label:"Fictional screenshot",confidence:"high"},description:"Summary showed duration, distance, pace and average HR",fields:["durationMinutes","distanceKm","pace","averageHeartRate"],retainedRaw:false}]:[],idempotencyKey:key("complete")})}
 const progress=await op(page,{operation:"getProgress",athleteId:alex.id,periodStart:"2026-09-14",periodEnd:"2026-09-20"});expect(progress.factualSummary.completed).toBe(3);
 await op(page,{operation:"createReview",athleteId:alex.id,periodStart:"2026-09-14",periodEnd:"2026-09-20",summary:"All planned sessions were completed with recoverable effort.",goalAssessments:[{goalId:numericGoal.id,status:"progressing",summary:"Aerobic work is consistent; more benchmark evidence is needed."}],recommendedDirection:"Keep strength load stable and add modest easy-run duration.",evidenceRefs:[`workout:${strength.id}`],idempotencyKey:key("review")});
 const next=await op(page,{operation:"getPlanningContext",athleteId:alex.id,weekStart:"2026-09-21"});expect(next.previousReview.summary).toContain("All planned sessions");
 const blairContext=await op(page,{operation:"getAthleteContext",athleteId:blair.id});expect(blairContext.entries).toHaveLength(0);expect(JSON.stringify(blairContext)).not.toContain("30 minute 5K");
 const wrong=await page.request.post("/api/v1/action",{data:{operation:"getPlan",athleteId:blair.id,planId:draft.id}});expect(wrong.status()).toBe(404);
 await page.goto("/athlete");await page.getByLabel("Active athlete").selectOption(alex.id);await expect(page.getByRole("heading",{name:`Alex ${suffix}`})).toBeVisible();await expect(page.getByText("Coach Rowan")).toBeVisible();
 await page.goto("/plan");await page.getByLabel("Week starting").fill(week);await expect(page.getByText("accepted baseline v2")).toBeVisible();await expect(page.getByText("adapted",{exact:true})).toBeVisible();
 await page.goto("/today");await page.getByLabel("View date").fill("2026-09-14");await expect(page.getByText("Upper strength")).toBeVisible();
 await page.goto("/progress");await expect(page.getByText(/sessions completed/)).toBeVisible();
});
