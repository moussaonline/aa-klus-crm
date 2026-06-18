"use client";

import { AlertTriangle, CheckCircle2, ClipboardList, KeyRound, Mail, Megaphone, RefreshCw, Send, UploadCloud } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { mapFacebookLeadToCRMLead, mapGoogleAdsLeadToCRMLead, parseLeadEmail, type ImportedLead, type LeadImportLog, type LeadImportPayload, type LeadImportSource } from "@/domain/lead-import";
import { cn } from "@/lib/classnames";

interface LeadImportState {
  leads: ImportedLead[];
  logs: LeadImportLog[];
  sources: Array<{ source: string; status: string; lastImport?: string; leadsToday: number }>;
}

const sourceCards: Array<{ source: LeadImportSource; title: string; icon: React.ElementType; description: string }> = [
  { source: "website", title: "Website", icon: UploadCloud, description: "Contact- en offerteformulieren vanaf aaklus.nl." },
  { source: "email", title: "E-mail", icon: Mail, description: "Parser voor contactformulieren die per e-mail binnenkomen." },
  { source: "facebook", title: "Facebook", icon: Megaphone, description: "Voorbereid voor Facebook Lead Ads webhooks." },
  { source: "google_ads", title: "Google Ads", icon: ClipboardList, description: "Voorbereid voor Google Ads lead form extensies." }
];

const demoEmail = `Naam: Jan Jansen
Telefoon: 0612345678
E-mail: jan@example.com
Plaats: Amsterdam
Project: Badkamer renovatie
Budget: 10000
Bericht: Ik wil mijn badkamer met spoed laten renoveren.`;

export function LeadImportApp() {
  const [apiKey, setApiKey] = useState("dev-import-key");
  const [state, setState] = useState<LeadImportState>({ leads: [], logs: [], sources: [] });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const errors = useMemo(() => state.logs.filter((log) => log.status === "error"), [state.logs]);

  useEffect(() => {
    void refreshState();
  }, []);

  async function refreshState() {
    const response = await fetch("/api/leads/import", { cache: "no-store" });
    setState(await response.json());
  }

  async function submitImport(label: string, payload: LeadImportPayload) {
    setBusy(label);
    setError(null);
    try {
      const response = await fetch("/api/leads/import", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey
        },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Import mislukt.");
      }
      await refreshState();
    } finally {
      setBusy(null);
    }
  }

  const tests = [
    {
      label: "Website lead testen",
      payload: {
        name: "Jan Jansen",
        phone: "0612345678",
        email: "jan@example.com",
        source: "website",
        message: "Ik wil een badkamer laten renoveren",
        projectType: "badkamer",
        city: "Amsterdam",
        budget: "10000-15000",
        preferredDate: "volgende maand",
        campaign: "website-contactformulier",
        externalId: "web-demo-001"
      } satisfies LeadImportPayload
    },
    {
      label: "Facebook lead testen",
      payload: mapFacebookLeadToCRMLead({
        full_name: "Fatima El Amrani",
        phone_number: "0622223333",
        email: "fatima@example.com",
        city: "Utrecht",
        project_type: "keuken",
        budget: "15000",
        campaign: "FB Badkamer Juni",
        id: "fb-demo-001"
      })
    },
    {
      label: "Google Ads lead testen",
      payload: mapGoogleAdsLeadToCRMLead({
        user_column_data: [
          { column_name: "full_name", string_value: "Pieter Bakker" },
          { column_name: "phone_number", string_value: "0633334444" },
          { column_name: "email", string_value: "pieter@example.com" },
          { column_name: "city", string_value: "Haarlem" },
          { column_name: "project_type", string_value: "zolder" },
          { column_name: "budget", string_value: "8000-12000" }
        ],
        campaign: "Google Renovatie Leads",
        lead_id: "gads-demo-001"
      })
    },
    {
      label: "E-mail tekst testen",
      payload: {
        ...parseLeadEmail(demoEmail),
        campaign: "mail-contactformulier",
        externalId: "mail-demo-001"
      }
    }
  ];

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid w-full max-w-7xl gap-5 px-3 py-3 sm:px-4 md:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-6">
        <aside className="rounded-lg border border-brand-100 bg-white/95 p-4 shadow-soft lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <a href="/" className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-800 text-white">
              <Send size={21} aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-900">AA Klus</p>
              <p className="text-xs font-medium text-slate-500">Lead Import</p>
            </div>
          </a>
          <nav className="mt-4 grid gap-1">
            <a href="/" className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold text-slate-600 hover:bg-brand-50">CRM Dashboard</a>
            <a href="/lead-import" className="flex min-h-11 items-center gap-2 rounded-md bg-brand-100 px-3 text-sm font-semibold text-brand-900">Lead Import</a>
          </nav>
          <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Geen klanten-import</p>
            <p className="mt-1">Deze module maakt alleen leads en importlogs aan.</p>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-5 grid gap-4 rounded-lg border border-brand-100 bg-white/95 p-4 shadow-soft md:grid-cols-[1fr_360px] md:items-end">
            <div>
              <p className="text-sm font-semibold text-brand-700">Automatische lead-import</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">Lead Import</h1>
              <p className="mt-2 text-sm text-slate-600">E-mail, websiteformulieren, Facebook Lead Ads en Google Ads lead forms komen samen binnen via een beveiligde import-API.</p>
            </div>
            <Field label="API-key instellingen">
              <div className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-3 text-slate-400" size={17} aria-hidden />
                <input className={cn(inputClass, "w-full pl-10")} value={apiKey} onChange={(event) => setApiKey(event.target.value)} placeholder="IMPORT_API_KEY" />
              </div>
            </Field>
          </header>

          {error && (
            <div className="mb-5 flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-800">
              <AlertTriangle size={18} aria-hidden /> {error}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {sourceCards.map((card) => {
              const Icon = card.icon;
              const sourceState = state.sources.find((item) => item.source === card.source);
              return (
                <article key={card.source} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-800">
                      <Icon size={19} aria-hidden />
                    </div>
                    <Badge tone={sourceState?.status === "error" ? "red" : sourceState?.status === "success" ? "green" : sourceState?.status === "duplicate" ? "amber" : "slate"}>
                      {sourceState?.status ?? "wacht op import"}
                    </Badge>
                  </div>
                  <h2 className="mt-4 font-bold text-slate-950">{card.title}</h2>
                  <p className="mt-1 min-h-10 text-sm text-slate-500">{card.description}</p>
                  <dl className="mt-4 grid gap-2 text-sm">
                    <div className="flex justify-between gap-3"><dt className="text-slate-500">Laatste import</dt><dd className="font-semibold text-slate-800">{sourceState?.lastImport ? new Date(sourceState.lastImport).toLocaleString("nl-NL") : "Geen"}</dd></div>
                    <div className="flex justify-between gap-3"><dt className="text-slate-500">Vandaag</dt><dd className="font-semibold text-slate-800">{sourceState?.leadsToday ?? 0}</dd></div>
                  </dl>
                </article>
              );
            })}
          </section>

          <section className="mt-5 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-950">Test import</h2>
              <Button onClick={refreshState} className="bg-slate-800"><RefreshCw size={16} aria-hidden /> Vernieuwen</Button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {tests.map((test) => (
                <Button key={test.label} onClick={() => submitImport(test.label, test.payload)} disabled={busy !== null}>
                  {busy === test.label ? <RefreshCw size={16} aria-hidden /> : <Send size={16} aria-hidden />}
                  {test.label}
                </Button>
              ))}
            </div>
          </section>

          <section className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <DataPanel title="Geïmporteerde leads">
              <ResponsiveTable headers={["Naam", "Bron", "Contact", "Project", "Prioriteit"]}>
                {state.leads.map((lead) => (
                  <tr key={lead.id} className="border-t border-slate-100">
                    <td className="break-words py-3 pr-2 font-semibold">{lead.name}</td>
                    <td className="break-words pr-2">{lead.source}</td>
                    <td className="break-words pr-2">{lead.email || lead.phone}</td>
                    <td className="break-words pr-2">{lead.projectType ?? "-"}</td>
                    <td><Badge tone={lead.priority === "hoog" ? "red" : "green"}>{lead.priority}</Badge></td>
                  </tr>
                ))}
              </ResponsiveTable>
            </DataPanel>

            <DataPanel title="Foutenlog">
              <div className="grid gap-3">
                {errors.length === 0 && <p className="text-sm text-slate-500">Geen importfouten.</p>}
                {errors.map((log) => (
                  <div key={log.id} className="rounded-md border border-rose-100 bg-rose-50 p-3 text-sm">
                    <p className="font-bold text-rose-800">{log.errorMessage}</p>
                    <p className="text-rose-700">{log.source} - {new Date(log.date).toLocaleString("nl-NL")}</p>
                  </div>
                ))}
              </div>
            </DataPanel>
          </section>

          <section className="mt-5">
            <DataPanel title="Recente imports">
              <ResponsiveTable headers={["Datum", "Bron", "Status", "External ID", "Payload"]}>
                {state.logs.map((log) => (
                  <tr key={log.id} className="border-t border-slate-100 align-top">
                    <td className="break-words py-3 pr-2">{new Date(log.date).toLocaleString("nl-NL")}</td>
                    <td className="break-words pr-2">{log.source}</td>
                    <td><Badge tone={log.status === "success" ? "green" : log.status === "duplicate" ? "amber" : "red"}>{log.status}</Badge></td>
                    <td className="break-words pr-2">{log.externalId ?? "-"}</td>
                    <td className="break-words text-xs text-slate-500">{JSON.stringify(log.rawPayload)}</td>
                  </tr>
                ))}
              </ResponsiveTable>
            </DataPanel>
          </section>
        </section>
      </div>
    </main>
  );
}

function DataPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="min-w-0 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function ResponsiveTable({ headers, children }: { headers: string[]; children: React.ReactNode }) {
  return (
    <div className="w-full max-w-full overflow-x-auto">
      <table className="w-full table-fixed text-left text-sm">
        <thead className="text-xs uppercase text-slate-500">
          <tr>{headers.map((header) => <th key={header} className="py-2 pr-3">{header}</th>)}</tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}
