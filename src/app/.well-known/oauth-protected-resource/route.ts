import { MCP_SCOPE } from "@/lib/mcp-oauth";
export const dynamic="force-dynamic";
export async function GET(request:Request){
 const origin=new URL(request.url).origin;
 return Response.json({
  resource:`${origin}/mcp`,
  authorization_servers:[origin],
  scopes_supported:[MCP_SCOPE],
  bearer_methods_supported:["header"],
  resource_name:"Coach private MCP"
 },{headers:{"cache-control":"no-store"}});
}
