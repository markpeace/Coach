import { clearHouseholdSession } from "@/lib/auth";
export async function POST() { await clearHouseholdSession(); return Response.json({ ok: true }); }
