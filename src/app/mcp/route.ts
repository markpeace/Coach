import { createCoachMcpHandler } from "@/mcp/server";
import { MCP_SCOPE, verifyMcpBearer } from "@/lib/mcp-oauth";
export const runtime="nodejs";
export const dynamic="force-dynamic";
const handler=createCoachMcpHandler();
function unauthorized(origin:string){
 return Response.json({error:"unauthorized"},{status:401,headers:{"cache-control":"no-store","www-authenticate":`Bearer resource_metadata="${origin}/.well-known/oauth-protected-resource", scope="${MCP_SCOPE}"`}});
}
async function handle(request:Request){
 const origin=new URL(request.url).origin;
 if(!verifyMcpBearer(request.headers.get("authorization"),origin))return unauthorized(origin);
 return handler.fetch(request);
}
export const GET=handle;
export const POST=handle;
export const DELETE=handle;
export async function OPTIONS(){return new Response(null,{status:204,headers:{allow:"GET, POST, DELETE, OPTIONS"}})}
