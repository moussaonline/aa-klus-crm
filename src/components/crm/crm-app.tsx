"use client";

import {
  BriefcaseBusiness,
  CalendarClock,
  ClipboardList,
  Euro,
  FileCheck2,
  FileText,
  Hammer,
  Home,
  Plus,
  ReceiptText,
  Search,
  Users
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, inputClass } from "@/components/ui/field";
import { formatEuro, quoteTotals } from "@/domain/finance";
import type { CrmSeed } from "@/data/crm-store";
import type { Customer, Invoice, Lead, Project, Quote, Task } from "@/domain/models";
import { cn } from "@/lib/classnames";
import { createId } from "@/lib/id";

type Section = "dashboard" | "customers" | "leads" | "projects" | "quotes" | "invoices" | "tasks";

const navItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "customers", label: "Klanten", icon: Users },
  { id: "leads", label: "Leads", icon: ClipboardList },
  { id: "projects", label: "Projecten", icon: Hammer },
  { id: "quotes", label: "Offertes", icon: FileText },
  { id: "invoices", label: "Facturen", icon: ReceiptText },
  { id: "tasks", label: "Taken", icon: CalendarClock }
];

export function CrmApp({ initialData }: { initialData: CrmSeed }) {
  const [active, setActive] = useState<Section>("dashboard");
  const [search, setSearch] = useState("");
  const [customers, setCustomers] = useState<Customer[]>(initialData.customers);
  const [leads, setLeads] = useState<Lead[]>(initialData.leads);
  const [projects, setProjects] = useState<Project[]>(initialData.projects);
  const [quotes, setQuotes] = useState<Quote[]>(initialData.quotes);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [tasks, setTasks] = useState<Task[]>(initialData.tasks);

  const monthlyRevenue = invoices.filter((invoice) => invoice.status === "betaald").reduce((sum, invoice) => sum + invoice.amount, 0);
  const openQuotes = quotes.filter((quote) => quote.status === "concept" || quote.status === "verzonden");
  const openInvoices = invoices.filter((invoice) => invoice.status === "concept" || invoice.status === "verzonden" || invoice.status === "te laat");
  const todayTasks = tasks.filter((task) => task.deadline === "2026-06-18" && task.status !== "afgerond");

  const searchResults = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];

    return [
      ...customers
        .filter((customer) => [customer.name, customer.phone, customer.email, customer.city].some((value) => value.toLowerCase().includes(term)))
        .map((customer) => ({ type: "Klant", label: customer.name, detail: `${customer.phone} - ${customer.city}` })),
      ...projects
        .filter((project) => project.title.toLowerCase().includes(term))
        .map((project) => ({ type: "Project", label: project.title, detail: project.status })),
      ...quotes
        .filter((quote) => quote.number.toLowerCase().includes(term))
        .map((quote) => ({ type: "Offerte", label: quote.number, detail: quote.status })),
      ...invoices
        .filter((invoice) => invoice.number.toLowerCase().includes(term))
        .map((invoice) => ({ type: "Factuur", label: invoice.number, detail: invoice.status }))
    ].slice(0, 8);
  }, [customers, invoices, projects, quotes, search]);

  return (
    <main className="min-h-screen">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-4 md:px-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:py-6">
        <aside className="rounded-lg border border-brand-100 bg-white/90 p-4 shadow-soft lg:sticky lg:top-6 lg:h-[calc(100vh-48px)]">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-brand-700 text-white">
              <BriefcaseBusiness size={22} aria-hidden />
            </div>
            <div>
              <p className="text-lg font-bold text-brand-900">AA Klus</p>
              <p className="text-xs font-medium text-slate-500">Renovatie CRM</p>
            </div>
          </div>

          <nav className="mt-4 grid gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-semibold text-slate-600 transition hover:bg-brand-50 hover:text-brand-800",
                    active === item.id && "bg-brand-100 text-brand-900"
                  )}
                  title={item.label}
                >
                  <Icon size={18} aria-hidden />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-5 rounded-md bg-slate-50 p-3 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">Rollen klaar</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {initialData.users.map((user) => (
                <Badge key={user.id} tone={user.role === "eigenaar/admin" ? "green" : "slate"}>
                  {user.role}
                </Badge>
              ))}
            </div>
          </div>
        </aside>

        <section className="min-w-0">
          <header className="mb-5 grid gap-4 rounded-lg border border-brand-100 bg-white/90 p-4 shadow-soft md:grid-cols-[1fr_360px] md:items-center">
            <div>
              <p className="text-sm font-semibold text-brand-700">Professioneel klant- en projectbeheer</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-950 md:text-3xl">AA Klus CRM</h1>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-3 text-slate-400" size={18} aria-hidden />
              <input
                className={cn(inputClass, "w-full pl-10")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Zoek klant, telefoon, project, offerte..."
              />
              {searchResults.length > 0 && (
                <div className="absolute right-0 top-12 z-20 w-full overflow-hidden rounded-md border border-slate-200 bg-white shadow-soft">
                  {searchResults.map((result) => (
                    <div key={`${result.type}-${result.label}`} className="border-b border-slate-100 px-3 py-2 last:border-b-0">
                      <p className="text-xs font-bold uppercase text-brand-700">{result.type}</p>
                      <p className="text-sm font-semibold text-slate-900">{result.label}</p>
                      <p className="text-xs text-slate-500">{result.detail}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </header>

          {active === "dashboard" && (
            <Dashboard
              customers={customers}
              leads={leads}
              projects={projects}
              openQuotes={openQuotes}
              openInvoices={openInvoices}
              monthlyRevenue={monthlyRevenue}
              todayTasks={todayTasks}
            />
          )}
          {active === "customers" && <Customers customers={customers} setCustomers={setCustomers} />}
          {active === "leads" && <Leads leads={leads} setLeads={setLeads} setTasks={setTasks} />}
          {active === "projects" && <Projects customers={customers} leads={leads} projects={projects} setProjects={setProjects} />}
          {active === "quotes" && <Quotes customers={customers} projects={projects} quotes={quotes} setQuotes={setQuotes} />}
          {active === "invoices" && <Invoices customers={customers} quotes={quotes} invoices={invoices} setInvoices={setInvoices} />}
          {active === "tasks" && <Tasks tasks={tasks} setTasks={setTasks} customers={customers} leads={leads} projects={projects} />}
        </section>
      </div>
    </main>
  );
}

function Dashboard({
  customers,
  leads,
  projects,
  openQuotes,
  openInvoices,
  monthlyRevenue,
  todayTasks
}: {
  customers: Customer[];
  leads: Lead[];
  projects: Project[];
  openQuotes: Quote[];
  openInvoices: Invoice[];
  monthlyRevenue: number;
  todayTasks: Task[];
}) {
  const cards = [
    { label: "Nieuwe leads", value: leads.filter((lead) => lead.status === "nieuw").length, icon: ClipboardList, tone: "green" },
    { label: "Lopende projecten", value: projects.filter((project) => project.status === "bezig" || project.status === "gepland").length, icon: Hammer, tone: "blue" },
    { label: "Open offertes", value: openQuotes.length, icon: FileText, tone: "amber" },
    { label: "Open facturen", value: openInvoices.length, icon: ReceiptText, tone: "red" },
    { label: "Omzet deze maand", value: formatEuro(monthlyRevenue), icon: Euro, tone: "green" },
    { label: "Taken vandaag", value: todayTasks.length, icon: CalendarClock, tone: "slate" }
  ];

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <p className="text-sm font-semibold text-slate-500">{card.label}</p>
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand-50 text-brand-700">
                  <Icon size={19} aria-hidden />
                </div>
              </div>
              <p className="mt-3 text-2xl font-bold text-slate-950">{card.value}</p>
            </article>
          );
        })}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Projectplanning">
          <div className="grid gap-3">
            {projects.map((project) => (
              <div key={project.id} className="rounded-md border border-slate-100 bg-slate-50 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">{project.title}</p>
                  <Badge tone={project.status === "bezig" ? "green" : "amber"}>{project.status}</Badge>
                </div>
                <div className="mt-2 h-2 rounded-full bg-slate-200">
                  <div className="h-2 rounded-full bg-brand-600" style={{ width: project.status === "bezig" ? "62%" : "28%" }} />
                </div>
                <p className="mt-2 text-sm text-slate-500">{project.startDate} - {project.endDate ?? "nog niet bekend"}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Taken voor vandaag">
          <div className="grid gap-3">
            {todayTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3 rounded-md border border-slate-100 bg-white p-3">
                <FileCheck2 className="mt-0.5 text-brand-700" size={18} aria-hidden />
                <div>
                  <p className="font-semibold text-slate-900">{task.title}</p>
                  <p className="text-sm text-slate-500">{task.status} - gekoppeld aan {task.relationType}</p>
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </div>
  );
}

function Customers({ customers, setCustomers }: { customers: Customer[]; setCustomers: React.Dispatch<React.SetStateAction<Customer[]>> }) {
  function addCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setCustomers((items) => [
      {
        id: createId("cust"),
        name: String(form.get("name")),
        phone: String(form.get("phone")),
        email: String(form.get("email")),
        address: String(form.get("address")),
        city: String(form.get("city")),
        type: form.get("type") as Customer["type"],
        notes: String(form.get("notes")),
        history: ["Klant handmatig toegevoegd"]
      },
      ...items
    ]);
    event.currentTarget.reset();
  }

  return (
    <CrudLayout
      title="Klantenbeheer"
      form={
        <form onSubmit={addCustomer} className="grid gap-3 md:grid-cols-2">
          <Field label="Naam"><input name="name" required className={inputClass} /></Field>
          <Field label="Telefoon"><input name="phone" required className={inputClass} /></Field>
          <Field label="E-mail"><input name="email" type="email" required className={inputClass} /></Field>
          <Field label="Woonplaats"><input name="city" required className={inputClass} /></Field>
          <Field label="Adres"><input name="address" required className={inputClass} /></Field>
          <Field label="Type klant"><Select name="type" options={["particulier", "aannemer", "vastgoedbeheerder", "bedrijf"]} /></Field>
          <Field label="Notities" className="md:col-span-2"><textarea name="notes" rows={3} className={inputClass} /></Field>
          <Button type="submit" className="md:col-span-2"><Plus size={16} aria-hidden /> Klant toevoegen</Button>
        </form>
      }
    >
      {customers.map((customer) => (
        <article key={customer.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-950">{customer.name}</h3>
              <p className="text-sm text-slate-500">{customer.address}, {customer.city}</p>
            </div>
            <Badge tone="green">{customer.type}</Badge>
          </div>
          <p className="mt-3 text-sm text-slate-700">{customer.phone} - {customer.email}</p>
          <p className="mt-2 text-sm text-slate-500">{customer.notes}</p>
          <div className="mt-3 border-t border-slate-100 pt-3">
            <p className="text-xs font-bold uppercase text-slate-500">Geschiedenis</p>
            <ul className="mt-2 grid gap-1 text-sm text-slate-600">
              {customer.history.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </article>
      ))}
    </CrudLayout>
  );
}

function Leads({ leads, setLeads, setTasks }: { leads: Lead[]; setLeads: React.Dispatch<React.SetStateAction<Lead[]>>; setTasks: React.Dispatch<React.SetStateAction<Task[]>> }) {
  function addLead(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const leadId = createId("lead");
    const followUp = String(form.get("followUp"));
    setLeads((items) => [
      {
        id: leadId,
        title: String(form.get("title")),
        customerName: String(form.get("customerName")),
        source: form.get("source") as Lead["source"],
        status: form.get("status") as Lead["status"],
        priority: form.get("priority") as Lead["priority"],
        createdAt: new Date().toISOString().slice(0, 10),
        notes: String(form.get("notes")),
        followUpTask: followUp || undefined
      },
      ...items
    ]);
    if (followUp) {
      setTasks((items) => [{ id: createId("task"), title: followUp, deadline: String(form.get("deadline")), status: "open", relationType: "lead", relationId: leadId }, ...items]);
    }
    event.currentTarget.reset();
  }

  return (
    <CrudLayout
      title="Leads"
      form={
        <form onSubmit={addLead} className="grid gap-3 md:grid-cols-2">
          <Field label="Lead titel"><input name="title" required className={inputClass} /></Field>
          <Field label="Naam contact"><input name="customerName" required className={inputClass} /></Field>
          <Field label="Bron"><Select name="source" options={["Facebook", "Google Ads", "Marktplaats", "website", "telefonisch", "via via"]} /></Field>
          <Field label="Status"><Select name="status" options={["nieuw", "contact opgenomen", "afspraak gepland", "offerte verstuurd", "gewonnen", "verloren"]} /></Field>
          <Field label="Prioriteit"><Select name="priority" options={["laag", "normaal", "hoog"]} /></Field>
          <Field label="Vervolgdeadline"><input name="deadline" type="date" className={inputClass} defaultValue="2026-06-19" /></Field>
          <Field label="Automatische vervolgtaak"><input name="followUp" className={inputClass} placeholder="Bijv. morgen nabellen" /></Field>
          <Field label="Notities"><input name="notes" className={inputClass} /></Field>
          <Button type="submit" className="md:col-span-2"><Plus size={16} aria-hidden /> Lead toevoegen</Button>
        </form>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {leads.map((lead) => (
          <article key={lead.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-slate-950">{lead.title}</h3>
              <Badge tone={lead.priority === "hoog" ? "red" : lead.priority === "normaal" ? "amber" : "slate"}>{lead.priority}</Badge>
            </div>
            <p className="mt-1 text-sm text-slate-500">{lead.customerName} - {lead.source}</p>
            <div className="mt-3"><Badge tone={lead.status === "gewonnen" ? "green" : "blue"}>{lead.status}</Badge></div>
            <p className="mt-3 text-sm text-slate-600">{lead.notes}</p>
            {lead.followUpTask && <p className="mt-2 text-sm font-semibold text-brand-700">{lead.followUpTask}</p>}
          </article>
        ))}
      </div>
    </CrudLayout>
  );
}

function Projects({ customers, leads, projects, setProjects }: { customers: Customer[]; leads: Lead[]; projects: Project[]; setProjects: React.Dispatch<React.SetStateAction<Project[]>> }) {
  function addProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProjects((items) => [
      {
        id: createId("proj"),
        title: String(form.get("title")),
        customerId: String(form.get("customerId")),
        leadId: String(form.get("leadId")) || undefined,
        type: form.get("type") as Project["type"],
        status: form.get("status") as Project["status"],
        startDate: String(form.get("startDate")),
        endDate: String(form.get("endDate")) || undefined,
        budget: Number(form.get("budget")),
        notes: String(form.get("notes"))
      },
      ...items
    ]);
    event.currentTarget.reset();
  }

  return (
    <CrudLayout
      title="Projecten"
      form={
        <form onSubmit={addProject} className="grid gap-3 md:grid-cols-2">
          <Field label="Projectnaam"><input name="title" required className={inputClass} /></Field>
          <Field label="Klant"><Select name="customerId" options={customers.map((customer) => customer.id)} labels={Object.fromEntries(customers.map((customer) => [customer.id, customer.name]))} /></Field>
          <Field label="Lead koppelen"><Select name="leadId" options={["", ...leads.map((lead) => lead.id)]} labels={{ "": "Geen lead", ...Object.fromEntries(leads.map((lead) => [lead.id, lead.title])) }} /></Field>
          <Field label="Type project"><Select name="type" options={["badkamer", "zolder", "renovatie", "schilderwerk", "stucwerk", "vloer", "keuken", "onderhoud", "overig"]} /></Field>
          <Field label="Status"><Select name="status" options={["intake", "offerte", "gepland", "bezig", "afgerond", "geannuleerd"]} /></Field>
          <Field label="Budget"><input name="budget" type="number" min="0" required className={inputClass} /></Field>
          <Field label="Startdatum"><input name="startDate" type="date" required className={inputClass} /></Field>
          <Field label="Einddatum"><input name="endDate" type="date" className={inputClass} /></Field>
          <Field label="Projectnotities" className="md:col-span-2"><textarea name="notes" rows={3} className={inputClass} /></Field>
          <Button type="submit" className="md:col-span-2"><Plus size={16} aria-hidden /> Project aanmaken</Button>
        </form>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        {projects.map((project) => (
          <article key={project.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{project.title}</h3>
                <p className="text-sm text-slate-500">{customers.find((customer) => customer.id === project.customerId)?.name}</p>
              </div>
              <Badge tone={project.status === "bezig" ? "green" : "amber"}>{project.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">{project.notes}</p>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Metric label="Type" value={project.type} />
              <Metric label="Budget" value={formatEuro(project.budget)} />
              <Metric label="Start" value={project.startDate} />
              <Metric label="Einde" value={project.endDate ?? "n.t.b."} />
            </div>
            <p className="mt-3 text-xs text-slate-500">Foto's en documenten zijn voorbereid voor een latere uploadmodule.</p>
          </article>
        ))}
      </div>
    </CrudLayout>
  );
}

function Quotes({ customers, projects, quotes, setQuotes }: { customers: Customer[]; projects: Project[]; quotes: Quote[]; setQuotes: React.Dispatch<React.SetStateAction<Quote[]>> }) {
  function addQuote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setQuotes((items) => [
      {
        id: createId("quote"),
        number: `OFF-2026-${String(items.length + 16).padStart(3, "0")}`,
        customerId: String(form.get("customerId")),
        projectId: String(form.get("projectId")) || undefined,
        status: form.get("status") as Quote["status"],
        createdAt: new Date().toISOString().slice(0, 10),
        lines: [
          {
            id: createId("line"),
            description: String(form.get("description")),
            quantity: Number(form.get("quantity")),
            unitPrice: Number(form.get("unitPrice")),
            vatRate: Number(form.get("vatRate"))
          }
        ]
      },
      ...items
    ]);
    event.currentTarget.reset();
  }

  return (
    <CrudLayout
      title="Offertes"
      form={
        <form onSubmit={addQuote} className="grid gap-3 md:grid-cols-2">
          <Field label="Klant"><Select name="customerId" options={customers.map((customer) => customer.id)} labels={Object.fromEntries(customers.map((customer) => [customer.id, customer.name]))} /></Field>
          <Field label="Project"><Select name="projectId" options={["", ...projects.map((project) => project.id)]} labels={{ "": "Geen project", ...Object.fromEntries(projects.map((project) => [project.id, project.title])) }} /></Field>
          <Field label="Status"><Select name="status" options={["concept", "verzonden", "geaccepteerd", "afgewezen"]} /></Field>
          <Field label="Omschrijving"><input name="description" required className={inputClass} /></Field>
          <Field label="Aantal"><input name="quantity" type="number" min="0" step="0.01" required className={inputClass} /></Field>
          <Field label="Prijs"><input name="unitPrice" type="number" min="0" step="0.01" required className={inputClass} /></Field>
          <Field label="BTW %"><input name="vatRate" type="number" defaultValue="21" className={inputClass} /></Field>
          <Button type="submit"><Plus size={16} aria-hidden /> Offerte maken</Button>
        </form>
      }
    >
      <div className="grid gap-3">
        {quotes.map((quote) => {
          const totals = quoteTotals(quote.lines);
          return (
            <article key={quote.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-bold text-slate-950">{quote.number}</h3>
                  <p className="text-sm text-slate-500">{customers.find((customer) => customer.id === quote.customerId)?.name}</p>
                </div>
                <Badge tone={quote.status === "geaccepteerd" ? "green" : quote.status === "afgewezen" ? "red" : "amber"}>{quote.status}</Badge>
              </div>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead className="text-xs uppercase text-slate-500">
                    <tr><th className="py-2">Omschrijving</th><th>Aantal</th><th>Prijs</th><th>BTW</th><th>Totaal</th></tr>
                  </thead>
                  <tbody>
                    {quote.lines.map((line) => (
                      <tr key={line.id} className="border-t border-slate-100">
                        <td className="py-2">{line.description}</td>
                        <td>{line.quantity}</td>
                        <td>{formatEuro(line.unitPrice)}</td>
                        <td>{line.vatRate}%</td>
                        <td>{formatEuro(line.quantity * line.unitPrice * (1 + line.vatRate / 100))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex flex-wrap justify-end gap-3 text-sm font-semibold">
                <span>Excl. BTW: {formatEuro(totals.subtotal)}</span>
                <span>BTW: {formatEuro(totals.vat)}</span>
                <span className="text-brand-800">Incl. BTW: {formatEuro(totals.total)}</span>
              </div>
              <p className="mt-3 text-xs text-slate-500">PDF-export kan later op deze offertetotalen aansluiten.</p>
            </article>
          );
        })}
      </div>
    </CrudLayout>
  );
}

function Invoices({ customers, quotes, invoices, setInvoices }: { customers: Customer[]; quotes: Quote[]; invoices: Invoice[]; setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>> }) {
  function addInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const quoteId = String(form.get("quoteId"));
    const quote = quotes.find((item) => item.id === quoteId);
    setInvoices((items) => [
      {
        id: createId("inv"),
        number: `FAC-2026-${String(items.length + 42).padStart(3, "0")}`,
        customerId: String(form.get("customerId")),
        quoteId: quoteId || undefined,
        status: form.get("status") as Invoice["status"],
        dueDate: String(form.get("dueDate")),
        amount: quote ? quoteTotals(quote.lines).total : Number(form.get("amount"))
      },
      ...items
    ]);
    event.currentTarget.reset();
  }

  return (
    <CrudLayout
      title="Facturen"
      form={
        <form onSubmit={addInvoice} className="grid gap-3 md:grid-cols-2">
          <Field label="Klant"><Select name="customerId" options={customers.map((customer) => customer.id)} labels={Object.fromEntries(customers.map((customer) => [customer.id, customer.name]))} /></Field>
          <Field label="Van offerte"><Select name="quoteId" options={["", ...quotes.map((quote) => quote.id)]} labels={{ "": "Losse factuur", ...Object.fromEntries(quotes.map((quote) => [quote.id, quote.number])) }} /></Field>
          <Field label="Status"><Select name="status" options={["concept", "verzonden", "betaald", "te laat"]} /></Field>
          <Field label="Betaaltermijn"><input name="dueDate" type="date" required className={inputClass} /></Field>
          <Field label="Bedrag voor losse factuur"><input name="amount" type="number" min="0" step="0.01" defaultValue="0" className={inputClass} /></Field>
          <Button type="submit"><Plus size={16} aria-hidden /> Factuur aanmaken</Button>
        </form>
      }
    >
      <div className="grid gap-3 md:grid-cols-2">
        {invoices.map((invoice) => (
          <article key={invoice.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-bold text-slate-950">{invoice.number}</h3>
                <p className="text-sm text-slate-500">{customers.find((customer) => customer.id === invoice.customerId)?.name}</p>
              </div>
              <Badge tone={invoice.status === "betaald" ? "green" : invoice.status === "te laat" ? "red" : "amber"}>{invoice.status}</Badge>
            </div>
            <p className="mt-4 text-2xl font-bold text-brand-800">{formatEuro(invoice.amount)}</p>
            <p className="text-sm text-slate-500">Betaaltermijn: {invoice.dueDate}</p>
            <p className="mt-3 text-xs text-slate-500">Voorbereid voor latere e-Boekhouden-koppeling via API/service-laag.</p>
          </article>
        ))}
      </div>
    </CrudLayout>
  );
}

function Tasks({ tasks, setTasks, customers, leads, projects }: { tasks: Task[]; setTasks: React.Dispatch<React.SetStateAction<Task[]>>; customers: Customer[]; leads: Lead[]; projects: Project[] }) {
  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setTasks((items) => [
      {
        id: createId("task"),
        title: String(form.get("title")),
        deadline: String(form.get("deadline")),
        status: form.get("status") as Task["status"],
        relationType: form.get("relationType") as Task["relationType"],
        relationId: String(form.get("relationId"))
      },
      ...items
    ]);
    event.currentTarget.reset();
  }

  const relationLabels = {
    ...Object.fromEntries(customers.map((item) => [item.id, item.name])),
    ...Object.fromEntries(leads.map((item) => [item.id, item.title])),
    ...Object.fromEntries(projects.map((item) => [item.id, item.title]))
  };

  return (
    <CrudLayout
      title="Taken en agenda"
      form={
        <form onSubmit={addTask} className="grid gap-3 md:grid-cols-2">
          <Field label="Taak"><input name="title" required className={inputClass} /></Field>
          <Field label="Deadline"><input name="deadline" type="date" required className={inputClass} /></Field>
          <Field label="Status"><Select name="status" options={["open", "bezig", "afgerond"]} /></Field>
          <Field label="Koppelingstype"><Select name="relationType" options={["klant", "lead", "project"]} /></Field>
          <Field label="Koppelen aan"><Select name="relationId" options={[...customers, ...leads, ...projects].map((item) => item.id)} labels={relationLabels} /></Field>
          <Button type="submit"><Plus size={16} aria-hidden /> Taak toevoegen</Button>
        </form>
      }
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {tasks.map((task) => (
          <article key={task.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h3 className="font-bold text-slate-950">{task.title}</h3>
              <Badge tone={task.status === "afgerond" ? "green" : "amber"}>{task.status}</Badge>
            </div>
            <p className="mt-3 text-sm text-slate-600">Deadline: {task.deadline}</p>
            <p className="text-sm text-slate-500">Gekoppeld aan {task.relationType}: {relationLabels[task.relationId] ?? task.relationId}</p>
            <p className="mt-3 text-xs text-slate-500">Herinneringen zijn voorbereid als uitbreidpunt.</p>
          </article>
        ))}
      </div>
    </CrudLayout>
  );
}

function CrudLayout({ title, form, children }: { title: string; form: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="grid gap-5">
      <Panel title={title}>{form}</Panel>
      <div>{children}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white/95 p-4 shadow-sm">
      <h2 className="mb-4 text-lg font-bold text-slate-950">{title}</h2>
      {children}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Select({ name, options, labels }: { name: string; options: string[]; labels?: Record<string, string> }) {
  return (
    <select name={name} className={inputClass}>
      {options.map((option) => (
        <option key={option} value={option}>
          {labels?.[option] ?? option}
        </option>
      ))}
    </select>
  );
}
