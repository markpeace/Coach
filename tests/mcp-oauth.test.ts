import { describe, expect, it } from "vitest";
import { createAccessToken, createMcpClientId, createPkceChallenge, createRefreshToken, normalizeMcpScope, verifyMcpBearer, verifyMcpClientId, verifyPkce, verifyRefreshToken } from "@/lib/mcp-oauth";

const secret="x".repeat(64);
const issuer="https://coach.example.test";

describe("Coach MCP OAuth tokens",()=>{
 it("signs and verifies a registered public client",()=>{
  const id=createMcpClientId(issuer,["https://chatgpt.com/callback"],"Coach test",0,secret);
  const client=verifyMcpClientId(id,issuer,1,secret);
  expect(client?.redirectUris).toEqual(["https://chatgpt.com/callback"]);
  expect(verifyMcpClientId(id+"x",issuer,1,secret)).toBeNull();
 });
 it("checks PKCE S256",()=>{
  const verifier="a".repeat(64);const challenge=createPkceChallenge(verifier);
  expect(verifyPkce(verifier,challenge)).toBe(true);
  expect(verifyPkce("b".repeat(64),challenge)).toBe(false);
 });
 it("requires the Coach scope",()=>{
  expect(normalizeMcpScope(undefined)).toBe("coach offline_access");
  expect(normalizeMcpScope("offline_access")).toBeNull();
  expect(normalizeMcpScope("coach nope")).toBeNull();
 });
 it("validates bearer and refresh tokens by issuer and expiry",()=>{
  const access=createAccessToken(issuer,"client","coach offline_access",0,secret);
  expect(verifyMcpBearer(`Bearer ${access}`,issuer,1,secret)?.sub).toBe("owner");
  expect(verifyMcpBearer(`Bearer ${access}`,"https://other.test",1,secret)).toBeNull();
  expect(verifyMcpBearer(`Bearer ${access}`,issuer,3_700_000,secret)).toBeNull();
  const refresh=createRefreshToken(issuer,"client","coach offline_access",0,secret);
  expect(verifyRefreshToken(refresh,issuer,1,secret)?.clientId).toBe("client");
 });
});
