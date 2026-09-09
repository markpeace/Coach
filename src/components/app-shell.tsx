"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export type Athlete = { id:string; displayName:string; name:string; timezone:string };
export function AppShell({athletes,athleteId,onAthlete,children}:{athletes:Athlete[];athleteId:string;onAthlete:(id:string)=>void;children:React.ReactNode}) {
 const pathname=usePathname(); const router=useRouter();
 async function logout(){await fetch("/api/auth/logout",{method:"POST"});router.replace("/login");router.refresh()}
 const nav=[["/today","Today"],["/plan","Plan"],["/progress","Progress"],["/athlete","Athlete"]] as const;
 return <main className="app"><header className="topbar"><Link className="brand" href="/today"><span className="brand-mark">C</span>Coach</Link><div className="athlete-switch">{athletes.length>0&&<select aria-label="Active athlete" value={athleteId} onChange={e=>onAthlete(e.target.value)}><option value="" disabled>Select athlete</option>{athletes.map(a=><option key={a.id} value={a.id}>{a.displayName}</option>)}</select>}<button className="button ghost" onClick={logout} aria-label="Sign out">↗</button></div></header>{children}<nav className="bottom-nav" aria-label="Primary">{nav.map(([href,label])=><Link key={href} href={href} className={pathname===href?"active":""}>{label}</Link>)}</nav></main>
}
