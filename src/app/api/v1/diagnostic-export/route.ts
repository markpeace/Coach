import { buildAthleteDiagnosticExport } from "@/domain/diagnostic-export";
import { uuid } from "@/domain/contracts";
import { hasHouseholdSession } from "@/lib/auth";
import { apiFailure } from "@/lib/api";

export const dynamic = "force-dynamic";

function safeFilenamePart(value: string) {
  const cleaned = value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "athlete";
}

export async function GET(request: Request) {
  try {
    if (!(await hasHouseholdSession())) {
      return Response.json({ ok: false, error: { code: "AUTH", message: "Authentication required" } }, { status: 401, headers: { "cache-control": "no-store" } });
    }

    const athleteId = uuid.parse(new URL(request.url).searchParams.get("athleteId"));
    const bundle = await buildAthleteDiagnosticExport(athleteId);
    const date = bundle.manifest.generatedAt.slice(0, 10);
    const filename = `coach-${safeFilenamePart(bundle.athlete.displayName)}-diagnostic-${date}.json`;

    return new Response(`${JSON.stringify(bundle, null, 2)}\n`, {
      status: 200,
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
        "x-content-type-options": "nosniff",
      },
    });
  } catch (error) {
    return apiFailure(error);
  }
}
