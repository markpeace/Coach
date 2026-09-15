CREATE TABLE "mcp_oauth_codes" (
  "jti" text PRIMARY KEY,
  "expires_at" timestamptz NOT NULL,
  "created_at" timestamptz NOT NULL DEFAULT now()
);
