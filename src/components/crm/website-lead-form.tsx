"use client";

import { CheckCircle2, Hammer, Loader2, Send, ShieldCheck, Wrench } from "lucide-react";
import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { cn } from "@/lib/classnames";

type SubmitState = "idle" | "submitting" | "success" | "duplicate" | "error";

export function WebsiteLeadForm() {
  const [state, setState] = useState<SubmitState>("idle");
  const [message, setMessage] = useState("");

  async function submitLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setState("submitting");
    setMessage("");

    const form = new FormData(formElement);
    const payload = {
      name: String(form.get("name")),
      phone: String(form.get("phone")),
      email: String(form.get("email")),
      projectType: String(form.get("projectType")),
      city: String(form.get("city")),
      budget: String(form.get("budget")),
      preferredDate: String(form.get("preferredDate")),
      message: String(form.get("message")),
      campaign: "AA Klus websiteformulier"
    };

    try {
      const response = await fetch("/api/website-leads", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();

      if (!response.ok) {
        setState("error");
        setMessage(result.message ?? "Verzenden is mislukt. Probeer het later opnieuw.");
        return;
      }

      setState(result.status === "duplicate" ? "duplicate" : "success");
      setMessage(result.message);
      formElement.reset();
    } catch {
      setState("error");
      setMessage("Verzenden is mislukt. Controleer je verbinding en probeer opnieuw.");
    }
  }

  return (
    <main className="min-h-screen bg-slate-100">
      <section className="mx-auto grid min-h-screen w-full max-w-6xl gap-6 px-4 py-6 md:grid-cols-[0.9fr_1.1fr] md:items-center md:px-6">
        <div className="py-4">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-brand-800 text-white">
              <Hammer size={24} aria-hidden />
            </div>
            <div>
              <p className="text-2xl font-bold text-brand-900">AA Klus</p>
              <p className="text-sm font-semibold text-slate-500">Renovatie en onderhoud</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-950 md:text-5xl">Vraag direct je renovatie aan</h1>
          <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
            Vertel kort wat er moet gebeuren. Je aanvraag wordt automatisch als websitelead in AA Klus CRM gezet, zodat we snel kunnen opvolgen.
          </p>
          <div className="mt-6 grid gap-3 text-sm font-semibold text-slate-700">
            <div className="flex items-center gap-2"><ShieldCheck className="text-brand-700" size={18} aria-hidden /> Veilig verzonden via server-side lead-import</div>
            <div className="flex items-center gap-2"><Wrench className="text-brand-700" size={18} aria-hidden /> Badkamer, keuken, zolder, onderhoud en renovatie</div>
          </div>
        </div>

        <form onSubmit={submitLead} className="rounded-lg border border-slate-200 bg-white p-4 shadow-soft md:p-6">
          <div className="mb-5">
            <h2 className="text-xl font-bold text-slate-950">Offerte aanvragen</h2>
            <p className="mt-1 text-sm text-slate-500">Velden met contactgegevens worden alleen als lead verwerkt.</p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <Field label="Naam"><input className={inputClass} name="name" required autoComplete="name" /></Field>
            <Field label="Telefoon"><input className={inputClass} name="phone" required autoComplete="tel" /></Field>
            <Field label="E-mail"><input className={inputClass} name="email" type="email" required autoComplete="email" /></Field>
            <Field label="Plaats"><input className={inputClass} name="city" required autoComplete="address-level2" /></Field>
            <Field label="Projecttype">
              <select className={inputClass} name="projectType" defaultValue="badkamer">
                <option value="badkamer">Badkamer</option>
                <option value="keuken">Keuken</option>
                <option value="zolder">Zolder</option>
                <option value="renovatie">Renovatie</option>
                <option value="schilderwerk">Schilderwerk</option>
                <option value="stucwerk">Stucwerk</option>
                <option value="vloer">Vloer</option>
                <option value="onderhoud">Onderhoud</option>
                <option value="overig">Overig</option>
              </select>
            </Field>
            <Field label="Budgetindicatie"><input className={inputClass} name="budget" placeholder="Bijv. 10000-15000" /></Field>
            <Field label="Gewenste periode" className="md:col-span-2"><input className={inputClass} name="preferredDate" placeholder="Bijv. volgende maand" /></Field>
            <Field label="Bericht" className="md:col-span-2"><textarea className={inputClass} name="message" rows={5} required placeholder="Beschrijf kort je klus of renovatie..." /></Field>
          </div>

          {message && (
            <div
              className={cn(
                "mt-4 flex items-start gap-2 rounded-md border p-3 text-sm font-semibold",
                state === "error" ? "border-rose-200 bg-rose-50 text-rose-800" : "border-brand-200 bg-brand-50 text-brand-900"
              )}
            >
              {state === "error" ? <Send size={18} aria-hidden /> : <CheckCircle2 size={18} aria-hidden />}
              {message}
            </div>
          )}

          <Button type="submit" disabled={state === "submitting"} className="mt-5 w-full">
            {state === "submitting" ? <Loader2 className="animate-spin" size={16} aria-hidden /> : <Send size={16} aria-hidden />}
            Aanvraag verzenden
          </Button>
        </form>
      </section>
    </main>
  );
}
