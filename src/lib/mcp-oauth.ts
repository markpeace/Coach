import "server-only";
import { createHash, createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db/client";
import { mcpOauthCodes } from "@/db/schema";
import { env } from "@/env";

const VERSION = 1;
export const MCP_SCOPE = "coach";
export const MCP_OFFLINE_SCOPE = "offline_access";
export const MCP_ALLOWED_SCOPES = [MCP_SCOPE, MCP_OFFLINE_SCOPE] as const;
const ACCESS_TTL_SECONDS = 60 * 60;
const REFRESH_TTL_SECONDS = 60 * 60 * 24 * 7;
const CODE_TTL_SECONDS = 5 * 60;
const CLIENT_TTL_SECONDS = 60 * 60 * 24 * 365;

type TokenKind = "client" | "code" | "access" | "refresh";
type BaseToken = { v:number; kind:TokenKind; iss:string; iat:number; exp:number };
export type ClientToken = BaseToken & { kind:"client"; redirectUris:string[]; clientName?:string };
export type CodeToken = BaseToken & { kind:"code"; jti:string; clientId:string; redirectUri:string; codeChallenge:string; scope:string; resource?:string };
export type AccessToken = BaseToken & { kind:"access"; clientId:string; scope:string; sub:"owner" };
export type RefreshToken = BaseToken & { kind:"refresh"; clientId:string; scope:string; sub:"owner" };

function secret(input?:string) {
  return createHmac("sha256", input ?? env().SESSION_SECRET).update("coach-mcp-oauth-v1").digest();
}
function signature(payload:string,input?:string){ return createHmac("sha256",secret(input)).update(payload).digest("base64url") }
function encode<T extends object>(value:T,input?:string){
  const payload=Buffer.from(JSON.stringify(value)).toString("base64url");
  return `${payload}.${signature(payload,input)}`;
}
function decode<T extends BaseToken>(token:string|undefined,kind:T["kind"],issuer:string,now=Date.now(),input?:string):T|null{
  if(!token)return null;
  const [payload,sig,extra]=token.split(".");
  if(!payload||!sig||extra)return null;
  const expected=signature(payload,input);
  if(sig.length!==expected.length||!timingSafeEqual(Buffer.from(sig),Buffer.from(expected)))return null;
  try{
    const value=JSON.parse(Buffer.from(payload,"base64url").toString()) as T;
    const nowSec=Math.floor(now/1000);
    if(value.v!==VERSION||value.kind!==kind||value.iss!==issuer||typeof value.iat!=="number"||typeof value.exp!=="number"||value.exp<=nowSec)return null;
    return value;
  }catch{return null}
}
function timed<T extends {kind:TokenKind;iss:string}>(data:T,ttl:number,now=Date.now()){
  const iat=Math.floor(now/1000);
  return {...data,v:VERSION,iat,exp:iat+ttl};
}
function scopeParts(scope:string){return [...new Set(scope.split(/\s+/).map(x=>x.trim()).filter(Boolean))]}
export function normalizeMcpScope(value:string|undefined){
  const requested=value?.trim()?scopeParts(value):[MCP_SCOPE,MCP_OFFLINE_SCOPE];
  if(requested.some(s=>!MCP_ALLOWED_SCOPES.includes(s as typeof MCP_ALLOWED_SCOPES[number])))return null;
  if(!requested.includes(MCP_SCOPE))return null;
  return requested.join(" ");
}
export function isAllowedRedirectUri(value:string){
  try{
    const u=new URL(value);
    return u.protocol==="https:"||(u.protocol==="http:"&&(u.hostname==="localhost"||u.hostname==="127.0.0.1"));
  }catch{return false}
}
export function createMcpClientId(issuer:string,redirectUris:string[],clientName?:string,now=Date.now(),input?:string){
  return encode(timed({kind:"client" as const,iss:issuer,redirectUris,clientName},CLIENT_TTL_SECONDS,now),input);
}
export function verifyMcpClientId(clientId:string|undefined,issuer:string,now=Date.now(),input?:string){
  return decode<ClientToken>(clientId,"client",issuer,now,input);
}
export function createPkceChallenge(verifier:string){return createHash("sha256").update(verifier).digest("base64url")}
export function verifyPkce(verifier:string,challenge:string){
  const actual=createPkceChallenge(verifier);
  return actual.length===challenge.length&&timingSafeEqual(Buffer.from(actual),Buffer.from(challenge));
}
export async function createAuthorizationCode(args:{issuer:string;clientId:string;redirectUri:string;codeChallenge:string;scope:string;resource?:string},now=Date.now(),input?:string){
  const jti=randomUUID();
  const exp=new Date(now+CODE_TTL_SECONDS*1000);
  await db().insert(mcpOauthCodes).values({jti,expiresAt:exp});
  return encode(timed({kind:"code" as const,iss:args.issuer,jti,clientId:args.clientId,redirectUri:args.redirectUri,codeChallenge:args.codeChallenge,scope:args.scope,resource:args.resource},CODE_TTL_SECONDS,now),input);
}
export async function consumeAuthorizationCode(token:string,issuer:string,now=Date.now(),input?:string){
  const parsed=decode<CodeToken>(token,"code",issuer,now,input);
  if(!parsed)return null;
  const [used]=await db().delete(mcpOauthCodes).where(and(eq(mcpOauthCodes.jti,parsed.jti),gt(mcpOauthCodes.expiresAt,new Date(now)))).returning();
  return used?parsed:null;
}
export function createAccessToken(issuer:string,clientId:string,scope:string,now=Date.now(),input?:string){
  return encode(timed({kind:"access" as const,iss:issuer,clientId,scope,sub:"owner" as const},ACCESS_TTL_SECONDS,now),input);
}
export function createRefreshToken(issuer:string,clientId:string,scope:string,now=Date.now(),input?:string){
  return encode(timed({kind:"refresh" as const,iss:issuer,clientId,scope,sub:"owner" as const},REFRESH_TTL_SECONDS,now),input);
}
export function verifyRefreshToken(token:string|undefined,issuer:string,now=Date.now(),input?:string){
  return decode<RefreshToken>(token,"refresh",issuer,now,input);
}
export function verifyMcpBearer(header:string|null,issuer:string,now=Date.now(),input?:string){
  const supplied=header?.replace(/^Bearer\s+/i,"")??"";
  const token=decode<AccessToken>(supplied,"access",issuer,now,input);
  return token&&scopeParts(token.scope).includes(MCP_SCOPE)?token:null;
}
export function tokenResponse(issuer:string,clientId:string,scope:string,now=Date.now(),input?:string){
  return {
    access_token:createAccessToken(issuer,clientId,scope,now,input),
    token_type:"Bearer",
    expires_in:ACCESS_TTL_SECONDS,
    refresh_token:createRefreshToken(issuer,clientId,scope,now,input),
    scope,
  };
}
