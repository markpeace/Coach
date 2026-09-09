import { isValidPassphrase, setHouseholdSession } from "@/lib/auth";
import { allowLoginAttempt } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0] ?? "local";
  if (!allowLoginAttempt(ip)) return Response.json({ ok: false, error: "Too many attempts. Try again later." }, { status: 429 });
  const body = await request.json().catch(() => ({})) as { passphrase?: string };
  if (!body.passphrase || !isValidPassphrase(body.passphrase)) return Response.json({ ok: false, error: "Passphrase not recognised" }, { status: 401 });
  await setHouseholdSession();
  return Response.json({ ok: true });
}
