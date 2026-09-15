import { consumeAuthorizationCode, normalizeMcpScope, tokenResponse, verifyMcpClientId, verifyPkce, verifyRefreshToken } from "@/lib/mcp-oauth";
function failure(error:string,description?:string){return Response.json({error,error_description:description},{status:400,headers:{"cache-control":"no-store"}})}
export async function POST(request:Request){
 const origin=new URL(request.url).origin;
 const form=new URLSearchParams(await request.text());
 const grant=form.get("grant_type");
 const clientId=form.get("client_id")??"";
 const client=verifyMcpClientId(clientId,origin);
 if(!client)return failure("invalid_client");
 if(grant==="authorization_code"){
  const code=form.get("code")??"";const redirectUri=form.get("redirect_uri")??"";const verifier=form.get("code_verifier")??"";
  const parsed=await consumeAuthorizationCode(code,origin);
  if(!parsed||parsed.clientId!==clientId||parsed.redirectUri!==redirectUri||!client.redirectUris.includes(redirectUri)||!verifyPkce(verifier,parsed.codeChallenge))return failure("invalid_grant");
  return Response.json(tokenResponse(origin,clientId,parsed.scope),{headers:{"cache-control":"no-store","pragma":"no-cache"}});
 }
 if(grant==="refresh_token"){
  const refresh=verifyRefreshToken(form.get("refresh_token")??undefined,origin);
  if(!refresh||refresh.clientId!==clientId)return failure("invalid_grant");
  const requested=form.get("scope");const scope=requested?normalizeMcpScope(requested):refresh.scope;
  if(!scope)return failure("invalid_scope");
  const original=new Set(refresh.scope.split(/\s+/));if(scope.split(/\s+/).some(s=>!original.has(s)))return failure("invalid_scope");
  return Response.json(tokenResponse(origin,clientId,scope),{headers:{"cache-control":"no-store","pragma":"no-cache"}});
 }
 return failure("unsupported_grant_type");
}
