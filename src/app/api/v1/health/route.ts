import { apiSuccess } from "@/lib/api";
export async function GET() { return apiSuccess({ service: "coach", status: "ok", version: "0.1.0" }); }
