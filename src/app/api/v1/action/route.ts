import { executeOperation } from "@/domain/service";
import { hasHouseholdSession, isValidActionKey } from "@/lib/auth";
import { apiFailure, apiSuccess } from "@/lib/api";

export async function POST(request: Request) {
  try {
    const household = await hasHouseholdSession();
    const action = isValidActionKey(request.headers.get("authorization"));
    if (!household && !action) return Response.json({ ok: false, error: { code: "AUTH", message: "Authentication required" } }, { status: 401 });
    const data = await executeOperation(await request.json());
    return apiSuccess(data);
  } catch (error) { return apiFailure(error); }
}
