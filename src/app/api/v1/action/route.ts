import { executeOperation } from "@/domain/service";
import { DomainError } from "@/domain/invariants";
import { hasHouseholdSession, isValidActionKey } from "@/lib/auth";
import { apiFailure, apiSuccess } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const household = await hasHouseholdSession();
    const action = isValidActionKey(request.headers.get("authorization"));
    if (!household && !action) return Response.json({ ok: false, error: { code: "AUTH", message: "Authentication required" } }, { status: 401 });
    const input = await request.json().catch(() => { throw new DomainError("VALIDATION", "Request body must be valid JSON"); });
    const data = await executeOperation(input);
    return apiSuccess(data);
  } catch (error) { return apiFailure(error); }
}
