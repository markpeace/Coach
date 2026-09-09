import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  HOUSEHOLD_PASSPHRASE: z.string().min(10),
  SESSION_SECRET: z.string().min(32),
  GPT_ACTION_API_KEY: z.string().min(24),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
});

export type CoachEnv = z.infer<typeof envSchema>;

let cached: CoachEnv | undefined;
export function env(): CoachEnv {
  cached ??= envSchema.parse(process.env);
  return cached;
}
