import "server-only";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { env } from "@/env";
import * as schema from "./schema";

let client: ReturnType<typeof postgres> | undefined;
let database: ReturnType<typeof drizzle<typeof schema>> | undefined;

export function db() {
  if (!database) {
    client = postgres(env().DATABASE_URL, { prepare: false, max: 5 });
    database = drizzle(client, { schema });
  }
  return database;
}
