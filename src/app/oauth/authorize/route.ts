import { isValidPassphrase } from "@/lib/auth";
import { createAuthorizationCode, normalizeMcpScope, verifyMcpClientId } from "@/lib/mcp-oauth";

type Params={clientId:string;redirectUri:string;state:string;scope:string;codeChallenge:string;resource?:string};
function esc(value:string){return value.replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]!))}
function parse(values:URLSearchParams,origin:string):Params|null{
 const clientId=values.get("client_id")??"";
 const redirectUri=values.get("redirect_uri")??"";
 const responseType=values.get("response_type");
 const state=values.get("state")??"";
 const codeChallenge=values.get("code_challenge")??"";
 const method=values.get("code_challenge_method");
 const scope=normalizeMcpScope(values.get("scope")??undefined);
 const resource=values.get("resource")??undefined;
 const client=verifyMcpClientId(clientId,origin);
 if(responseType!=="code"||method!=="S256"||!scope||!client||!client.redirectUris.includes(redirectUri)||codeChallenge.length<43)return null;
 if(resource&&resource!==`${origin}/mcp`)return null;
 return {clientId,redirectUri,state,scope,codeChallenge,resource};
}
function page(params:Params,error=""){
 const hidden=(name:string,value:string|undefined)=>value===undefined?"":`<input type="hidden" name="${name}" value="${esc(value)}">`;
 return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Connect Coach</title><style>body{font-family:system-ui;max-width:520px;margin:60px auto;padding:24px;color:#18372d}label{display:block;font-weight:650;margin:18px 0 8px}input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #bbc7bf;border-radius:10px}button{margin-top:20px;padding:12px 18px;border:0;border-radius:999px;background:#126047;color:white;font-weight:700}.error{color:#9b2c2c}</style></head><body><h1>Connect Coach</h1><p>Authorize this private ChatGPT app to read and update the Coach household training ledger.</p>${error?`<p class="error">${esc(error)}</p>`:""}<form method="post">${hidden("client_id",params.clientId)}${hidden("redirect_uri",params.redirectUri)}${hidden("state",params.state)}${hidden("scope",params.scope)}${hidden("code_challenge",params.codeChallenge)}${hidden("resource",params.resource)}<label for="passphrase">Household passphrase</label><input id="passphrase" name="passphrase" type="password" autocomplete="current-password" required><button type="submit">Authorize Coach</button></form></body></html>`;
}
const headers={"content-type":"text/html; charset=utf-8","cache-control":"no-store","content-security-policy":"default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; base-uri 'none'; frame-ancestors 'none'"};
export async function GET(request:Request){
 const url=new URL(request.url);const params=parse(url.searchParams,url.origin);
 if(!params)return new Response("Invalid OAuth authorization request",{status:400,headers:{"cache-control":"no-store"}});
 return new Response(page(params),{headers});
}
export async function POST(request:Request){
 const url=new URL(request.url);const form=await request.formData();
 const values=new URLSearchParams();
 for(const key of ["client_id","redirect_uri","state","scope","code_challenge","resource"]){const value=form.get(key);if(typeof value==="string"&&value)values.set(key,value)}
 values.set("response_type","code");values.set("code_challenge_method","S256");
 const params=parse(values,url.origin);
 if(!params)return new Response("Invalid OAuth authorization request",{status:400,headers:{"cache-control":"no-store"}});
 const passphrase=form.get("passphrase");
 if(typeof passphrase!=="string"||!isValidPassphrase(passphrase))return new Response(page(params,"Passphrase not accepted."),{status:401,headers});
 const code=await createAuthorizationCode({issuer:url.origin,clientId:params.clientId,redirectUri:params.redirectUri,codeChallenge:params.codeChallenge,scope:params.scope,resource:params.resource});
 const redirect=new URL(params.redirectUri);redirect.searchParams.set("code",code);if(params.state)redirect.searchParams.set("state",params.state);redirect.searchParams.set("iss",url.origin);
 return Response.redirect(redirect,302);
}
