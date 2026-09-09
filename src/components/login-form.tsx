"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const router=useRouter();
  async function submit(event:FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(""); const data=new FormData(event.currentTarget); const response=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({passphrase:data.get("passphrase")})}); const body=await response.json(); setBusy(false); if(!response.ok){setError(body.error??"Could not sign in");return;} router.replace("/today"); router.refresh(); }
  return <form onSubmit={submit}><div className="field"><label htmlFor="passphrase">Household passphrase</label><input id="passphrase" name="passphrase" type="password" required autoFocus autoComplete="current-password" /></div>{error&&<p className="error" role="alert">{error}</p>}<button className="button" disabled={busy} style={{width:"100%"}}>{busy?"Opening Coach…":"Open Coach"}</button></form>;
}
