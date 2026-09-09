import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
import { operationSchema } from "../src/domain/contracts";

const manifest=JSON.parse(await readFile("gpt/manifest.json","utf8"));
const files:string[]=manifest.files;const content=await Promise.all(files.map(file=>readFile(`gpt/${file}`)));
const api=JSON.parse(content[1].toString());
if(api.openapi!=="3.1.0"||api.info.version!==manifest.packageVersion)throw new Error("OpenAPI/package version mismatch");
if(!api.paths?.["/api/v1/action"]?.post)throw new Error("Action route missing from OpenAPI");
const sourceSchema=z.toJSONSchema(operationSchema,{target:"draft-7",unrepresentable:"any"});
const packaged=api.paths["/api/v1/action"].post.requestBody.content["application/json"].schema;
if(JSON.stringify(sourceSchema)!==JSON.stringify(packaged))throw new Error("OpenAPI request schema does not match runtime operation schema");
const checksum=createHash("sha256").update(Buffer.concat(content)).digest("hex");
await writeFile("gpt/package.sha256",`${checksum}  Coach-gpt-${manifest.packageVersion}\n`);
console.log(`Coach GPT package ${manifest.packageVersion} verified (${checksum.slice(0,12)})`);
