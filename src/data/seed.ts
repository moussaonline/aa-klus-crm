import type { Customer, Invoice, Lead, Project, Quote, Task, User } from "@/domain/models";

export const customers: Customer[] = [
  {
    id: "cust_001",
    name: "Familie De Vries",
    phone: "06 12 34 56 78",
    email: "devries@example.nl",
    address: "Lijsterstraat 14",
    city: "Amsterdam",
    type: "particulier",
    notes: "Wil badkamer en toilet in dezelfde planning laten doen.",
    history: ["Lead via website", "Intake op locatie uitgevoerd", "Offerte badkamer verzonden"]
  },
  {
    id: "cust_002",
    name: "Vastgoed Noord BV",
    phone: "020 555 0191",
    email: "beheer@vastgoednoord.nl",
    address: "Herengracht 88",
    city: "Amsterdam",
    type: "vastgoedbeheerder",
    notes: "Vaste klant voor onderhoud aan huurwoningen.",
    history: ["Onderhoudscontract besproken", "Spoedreparatie keuken afgerond"]
  },
  {
    id: "cust_003",
    name: "Bakker Bouwservice",
    phone: "06 98 76 54 32",
    email: "planning@bakkerbouw.nl",
    address: "Industrieweg 7",
    city: "Zaandam",
    type: "aannemer",
    notes: "Regelmatig onderaanneming voor schilder- en stucwerk.",
    history: ["Kennismaking via via", "Project zolderrenovatie ingepland"]
  }
];

export const leads: Lead[] = [
  {
    id: "lead_001",
    title: "Complete badkamerrenovatie",
    customerName: "Familie De Vries",
    source: "website",
    status: "offerte verstuurd",
    priority: "hoog",
    createdAt: "2026-06-12",
    notes: "Klant wil starten na bouwvak.",
    followUpTask: "Vrijdag nabellen over offerte"
  },
  {
    id: "lead_002",
    title: "Schilderwerk appartementencomplex",
    customerName: "Vastgoed Noord BV",
    source: "telefonisch",
    status: "afspraak gepland",
    priority: "normaal",
    createdAt: "2026-06-15",
    notes: "Opname gepland met beheerder."
  },
  {
    id: "lead_003",
    title: "Keuken plaatsen in nieuwbouwwoning",
    customerName: "R. Jansen",
    source: "Google Ads",
    status: "nieuw",
    priority: "hoog",
    createdAt: "2026-06-18",
    notes: "Nog geen klantrecord aangemaakt."
  }
];

export const projects: Project[] = [
  {
    id: "proj_001",
    title: "Badkamer renovatie De Vries",
    customerId: "cust_001",
    leadId: "lead_001",
    type: "badkamer",
    status: "offerte",
    startDate: "2026-07-22",
    endDate: "2026-08-02",
    budget: 14250,
    notes: "Sloop, leidingwerk, tegelwerk en montage sanitair."
  },
  {
    id: "proj_002",
    title: "Onderhoud huurwoningen Q3",
    customerId: "cust_002",
    type: "onderhoud",
    status: "bezig",
    startDate: "2026-06-03",
    endDate: "2026-09-30",
    budget: 28000,
    notes: "Doorlopend klein onderhoud en spoedklussen."
  },
  {
    id: "proj_003",
    title: "Zolderrenovatie Zaandam",
    customerId: "cust_003",
    type: "zolder",
    status: "gepland",
    startDate: "2026-07-01",
    endDate: "2026-07-12",
    budget: 9300,
    notes: "Dakisolatie, gipsplaten, stucwerk en schilderwerk."
  }
];

export const quotes: Quote[] = [
  {
    id: "quote_001",
    number: "OFF-2026-014",
    customerId: "cust_001",
    projectId: "proj_001",
    status: "verzonden",
    createdAt: "2026-06-16",
    lines: [
      { id: "line_001", description: "Sloop en afvoer bestaande badkamer", quantity: 1, unitPrice: 1250, vatRate: 21 },
      { id: "line_002", description: "Tegelwerk wand en vloer", quantity: 32, unitPrice: 85, vatRate: 21 },
      { id: "line_003", description: "Montage sanitair", quantity: 1, unitPrice: 2950, vatRate: 21 }
    ]
  },
  {
    id: "quote_002",
    number: "OFF-2026-015",
    customerId: "cust_003",
    projectId: "proj_003",
    status: "concept",
    createdAt: "2026-06-18",
    lines: [
      { id: "line_004", description: "Gipsplaten plaatsen en afwerken", quantity: 48, unitPrice: 54, vatRate: 21 },
      { id: "line_005", description: "Schilderwerk zolder", quantity: 1, unitPrice: 1800, vatRate: 21 }
    ]
  }
];

export const invoices: Invoice[] = [
  {
    id: "inv_001",
    number: "FAC-2026-041",
    customerId: "cust_002",
    status: "verzonden",
    dueDate: "2026-06-28",
    amount: 3872.5
  },
  {
    id: "inv_002",
    number: "FAC-2026-039",
    customerId: "cust_003",
    quoteId: "quote_002",
    status: "betaald",
    dueDate: "2026-06-12",
    amount: 5319.16
  }
];

export const tasks: Task[] = [
  {
    id: "task_001",
    title: "Offerte De Vries nabellen",
    deadline: "2026-06-18",
    status: "open",
    relationType: "klant",
    relationId: "cust_001"
  },
  {
    id: "task_002",
    title: "Opname schilderwerk voorbereiden",
    deadline: "2026-06-18",
    status: "bezig",
    relationType: "lead",
    relationId: "lead_002"
  },
  {
    id: "task_003",
    title: "Materiaalplanning zolderrenovatie",
    deadline: "2026-06-20",
    status: "open",
    relationType: "project",
    relationId: "proj_003"
  }
];

export const users: User[] = [
  { id: "user_001", name: "Ahmed AA Klus", email: "admin@aaklus.nl", role: "eigenaar/admin" },
  { id: "user_002", name: "Samira Planning", email: "planning@aaklus.nl", role: "medewerker" },
  { id: "user_003", name: "Yassin Verkoop", email: "verkoop@aaklus.nl", role: "verkoper" },
  { id: "user_004", name: "Nora Boekhouding", email: "boekhouding@aaklus.nl", role: "boekhouding" }
];
