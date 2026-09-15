import { z } from "zod";
import { createMcpClientId, isAllowedRedirectUri } from "@/lib/mcp-oauth";
const registration=z.object({
 redirect_uris:z.array(z.string()).min(1).max(10),
 client_name:z.string().max(120).optional(),
 token_endpoint_auth_method:z.string().optional(),
 grant_types:z.array(z.string()).optional(),
 response_types:z.array(z.string()).optional(),
 application_type:z.string().optional(),
}).passthrough();
export async function POST(request:Request){
 const origin=new URL(request.url).origin;
 const parsed=registration.safeParse(await request.json().catch(()=>null));
 if(!parsed.success||parsed.data.redirect_uris.some(uri=>!isAllowedRedirectUri(uri)))return Response.json({error:"invalid_client_metadata"},{status:400});
 if(parsed.data.token_endpoint_auth_method&&parsed.data.token_endpoint_auth_method!=="none")return Response.json({error:"invalid_client_metadata",error_description:"Coach supports public PKCE clients only"},{status:400});
 const clientId=createMcpClientId(origin,parsed.data.redirect_uris,parsed.data.client_name);
 return Response.json({
  client_id:clientId,
  client_id_issued_at:Math.floor(Date.now()/1000),
  redirect_uris:parsed.data.redirect_uris,
  client_name:parsed.data.client_name,
  application_type:parsed.data.application_type??"web",
  token_endpoint_auth_method:"none",
  grant_types:["authorization_code","refresh_token"],
  response_types:["code"]
 },{status:201,headers:{"cache-control":"no-store"}});
}
