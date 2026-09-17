import { describe, expect, it, vi } from "vitest";

const ATHLETE_ID = "00000000-0000-4000-8000-000000000001";
const mocks = vi.hoisted(() => ({
  household: true,
  build: vi.fn(async () => ({
    manifest: { generatedAt: "2026-09-17T21:00:00.000Z" },
    athlete: { id: ATHLETE_ID, displayName: "Mark Peace" },
    ledger: { decisionTraces: [] },
    timeline: [],
  })),
}));

vi.mock("@/lib/auth", () => ({ hasHouseholdSession: async () => mocks.household }));
vi.mock("@/domain/diagnostic-export", () => ({ buildAthleteDiagnosticExport: mocks.build }));
const { GET } = await import("@/app/api/v1/diagnostic-export/route");

describe("diagnostic export route", () => {
  it("fails closed without a household session", async () => {
    mocks.household = false;
    const response = await GET(new Request(`http://coach/api/v1/diagnostic-export?athleteId=${ATHLETE_ID}`));
    expect(response.status).toBe(401);
    expect(response.headers.get("cache-control")).toBe("no-store");
    mocks.household = true;
  });

  it("returns a no-store JSON attachment for the selected athlete", async () => {
    const response = await GET(new Request(`http://coach/api/v1/diagnostic-export?athleteId=${ATHLETE_ID}`));
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(response.headers.get("content-disposition")).toBe('attachment; filename="coach-mark-peace-diagnostic-2026-09-17.json"');
    expect(await response.json()).toMatchObject({ athlete: { id: ATHLETE_ID }, ledger: { decisionTraces: [] } });
    expect(mocks.build).toHaveBeenCalledWith(ATHLETE_ID);
  });

  it("rejects an invalid athlete id before export", async () => {
    const response = await GET(new Request("http://coach/api/v1/diagnostic-export?athleteId=not-a-uuid"));
    expect(response.status).toBe(400);
  });
});
