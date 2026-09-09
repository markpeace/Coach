import { redirect } from "next/navigation";
import { hasHouseholdSession } from "@/lib/auth";
export default async function PrivateLayout({ children }: { children: React.ReactNode }) { if (!(await hasHouseholdSession())) redirect("/login"); return children; }
