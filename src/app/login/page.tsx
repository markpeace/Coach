import { redirect } from "next/navigation";
import { hasHouseholdSession } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";

export default async function LoginPage() {
  if (await hasHouseholdSession()) redirect("/today");
  return <main className="login"><section className="login-card"><div className="brand"><span className="brand-mark">C</span>Coach</div><p className="eyebrow" style={{marginTop:36}}>Private household</p><h1>Your training,<br/>remembered.</h1><p className="muted">Enter the household passphrase to reach your athletes, plans and training history.</p><LoginForm /></section></main>;
}
