"use client";

import { FormEvent, useMemo, useState } from "react";
import { LockKeyhole, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";

export function LoginForm({ nextPath }: { nextPath?: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const safeNextPath = useMemo(() => {
    if (!nextPath || !nextPath.startsWith("/") || nextPath.startsWith("//")) return "/";
    return nextPath;
  }, [nextPath]);

  async function submitLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: String(form.get("password")) })
    });

    if (!response.ok) {
      const result = await response.json().catch(() => ({ message: "Inloggen mislukt." }));
      setError(result.message ?? "Inloggen mislukt.");
      setLoading(false);
      return;
    }

    window.location.href = safeNextPath;
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-100 px-4 py-8">
      <form onSubmit={submitLogin} className="w-full max-w-md rounded-lg border border-brand-100 bg-white p-6 shadow-soft">
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-800 text-white">
            <LockKeyhole size={22} aria-hidden />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-950">AA Klus CRM</h1>
            <p className="text-sm font-semibold text-slate-500">Beveiligde toegang</p>
          </div>
        </div>

        <Field label="Wachtwoord">
          <input className={inputClass} name="password" type="password" required autoFocus autoComplete="current-password" />
        </Field>

        {error && <p className="mt-3 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">{error}</p>}

        <Button type="submit" className="mt-5 w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" size={16} aria-hidden /> : <LockKeyhole size={16} aria-hidden />}
          Inloggen
        </Button>
      </form>
    </main>
  );
}
