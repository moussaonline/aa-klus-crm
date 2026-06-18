import {
  CustomerType,
  InvoiceStatus,
  LeadImportSource,
  LeadStatus,
  PlanningItem as PrismaPlanningItem,
  Prisma,
  Priority,
  ProjectAssetFolder,
  ProjectAssetType,
  ProjectStatus,
  ProjectType,
  QuoteStatus,
  TaskRelationType,
  TaskStatus,
  UserRole,
  WorkOrderStatus
} from "@prisma/client";
import type { Customer, Invoice, Lead, PlanningItem, Project, ProjectAsset, Quote, Task, User, WorkOrder } from "@/domain/models";
import { prisma } from "@/lib/prisma";

export interface CrmData {
  customers: Customer[];
  leads: Lead[];
  projects: Project[];
  quotes: Quote[];
  invoices: Invoice[];
  tasks: Task[];
  workOrders: WorkOrder[];
  planningItems: PlanningItem[];
  projectAssets: ProjectAsset[];
  users: User[];
}

export type CrmSeed = CrmData;

const quoteWithLines = Prisma.validator<Prisma.QuoteDefaultArgs>()({
  include: { lines: true }
});

type QuoteWithLines = Prisma.QuoteGetPayload<typeof quoteWithLines>;

export async function getCrmData(): Promise<CrmData> {
  const [
    customers,
    leads,
    projects,
    quotes,
    invoices,
    tasks,
    workOrders,
    planningItems,
    projectAssets,
    users
  ] = await Promise.all([
    prisma.customer.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.project.findMany({ orderBy: { startDate: "asc" } }),
    prisma.quote.findMany({ include: { lines: true }, orderBy: { createdAt: "desc" } }),
    prisma.invoice.findMany({ orderBy: { dueDate: "asc" } }),
    prisma.task.findMany({ orderBy: { deadline: "asc" } }),
    prisma.workOrder.findMany({ orderBy: { date: "asc" } }),
    prisma.planningItem.findMany({ orderBy: [{ date: "asc" }, { startTime: "asc" }] }),
    prisma.projectAsset.findMany({ orderBy: { uploadedAt: "desc" } }),
    prisma.user.findMany({ orderBy: { name: "asc" } })
  ]);

  return {
    customers: customers.map(mapCustomer),
    leads: leads.map(mapLead),
    projects: projects.map(mapProject),
    quotes: quotes.map(mapQuote),
    invoices: invoices.map(mapInvoice),
    tasks: tasks.map(mapTask),
    workOrders: workOrders.map(mapWorkOrder),
    planningItems: planningItems.map(mapPlanningItem),
    projectAssets: projectAssets.map(mapProjectAsset),
    users: users.map(mapUser)
  };
}

export async function getSearchResults(term: string) {
  const normalizedTerm = term.toLowerCase();

  if (!normalizedTerm) {
    return [];
  }

  const [customers, projects, quotes, invoices, workOrders] = await Promise.all([
    prisma.customer.findMany({
      where: {
        OR: [
          { name: { contains: normalizedTerm, mode: "insensitive" } },
          { phone: { contains: normalizedTerm, mode: "insensitive" } },
          { email: { contains: normalizedTerm, mode: "insensitive" } },
          { city: { contains: normalizedTerm, mode: "insensitive" } }
        ]
      }
    }),
    prisma.project.findMany({ where: { title: { contains: normalizedTerm, mode: "insensitive" } } }),
    prisma.quote.findMany({ where: { number: { contains: normalizedTerm, mode: "insensitive" } } }),
    prisma.invoice.findMany({ where: { number: { contains: normalizedTerm, mode: "insensitive" } } }),
    prisma.workOrder.findMany({ where: { number: { contains: normalizedTerm, mode: "insensitive" } } })
  ]);

  return [
    ...customers.map((customer) => ({ type: "customer", id: customer.id, label: customer.name })),
    ...projects.map((project) => ({ type: "project", id: project.id, label: project.title })),
    ...quotes.map((quote) => ({ type: "quote", id: quote.id, label: quote.number })),
    ...invoices.map((invoice) => ({ type: "invoice", id: invoice.id, label: invoice.number })),
    ...workOrders.map((workOrder) => ({ type: "workOrder", id: workOrder.id, label: workOrder.number }))
  ];
}

export const enumMaps = {
  customerTypeToDb: {
    particulier: CustomerType.PARTICULIER,
    aannemer: CustomerType.AANNEMER,
    vastgoedbeheerder: CustomerType.VASTGOEDBEHEERDER,
    bedrijf: CustomerType.BEDRIJF
  },
  leadStatusToDb: {
    nieuw: LeadStatus.NIEUW,
    "contact opgenomen": LeadStatus.CONTACT_OPGENOMEN,
    "afspraak gepland": LeadStatus.AFSPRAAK_GEPLAND,
    "offerte verstuurd": LeadStatus.OFFERTE_VERSTUURD,
    gewonnen: LeadStatus.GEWONNEN,
    verloren: LeadStatus.VERLOREN
  },
  priorityToDb: {
    laag: Priority.LAAG,
    normaal: Priority.NORMAAL,
    hoog: Priority.HOOG
  },
  projectTypeToDb: {
    badkamer: ProjectType.BADKAMER,
    zolder: ProjectType.ZOLDER,
    renovatie: ProjectType.RENOVATIE,
    schilderwerk: ProjectType.SCHILDERWERK,
    stucwerk: ProjectType.STUCWERK,
    vloer: ProjectType.VLOER,
    keuken: ProjectType.KEUKEN,
    onderhoud: ProjectType.ONDERHOUD,
    overig: ProjectType.OVERIG
  },
  projectStatusToDb: {
    intake: ProjectStatus.INTAKE,
    offerte: ProjectStatus.OFFERTE,
    gepland: ProjectStatus.GEPLAND,
    bezig: ProjectStatus.BEZIG,
    afgerond: ProjectStatus.AFGEROND,
    geannuleerd: ProjectStatus.GEANNULEERD
  },
  quoteStatusToDb: {
    concept: QuoteStatus.CONCEPT,
    verzonden: QuoteStatus.VERZONDEN,
    geaccepteerd: QuoteStatus.GEACCEPTEERD,
    afgewezen: QuoteStatus.AFGEWEZEN
  },
  invoiceStatusToDb: {
    concept: InvoiceStatus.CONCEPT,
    verzonden: InvoiceStatus.VERZONDEN,
    betaald: InvoiceStatus.BETAALD,
    "te laat": InvoiceStatus.TE_LAAT
  },
  taskStatusToDb: {
    open: TaskStatus.OPEN,
    bezig: TaskStatus.BEZIG,
    afgerond: TaskStatus.AFGEROND
  },
  taskRelationTypeToDb: {
    klant: TaskRelationType.KLANT,
    lead: TaskRelationType.LEAD,
    project: TaskRelationType.PROJECT
  },
  workOrderStatusToDb: {
    concept: WorkOrderStatus.CONCEPT,
    "in uitvoering": WorkOrderStatus.IN_UITVOERING,
    gereed: WorkOrderStatus.GEREED,
    gefactureerd: WorkOrderStatus.GEFACTUREERD
  },
  projectAssetFolderToDb: {
    "voor foto's": ProjectAssetFolder.VOOR_FOTOS,
    "na foto's": ProjectAssetFolder.NA_FOTOS,
    documenten: ProjectAssetFolder.DOCUMENTEN
  },
  projectAssetTypeToDb: {
    foto: ProjectAssetType.FOTO,
    pdf: ProjectAssetType.PDF,
    contract: ProjectAssetType.CONTRACT,
    factuur: ProjectAssetType.FACTUUR
  },
  userRoleToDb: {
    "eigenaar/admin": UserRole.ADMIN,
    medewerker: UserRole.MEDEWERKER,
    verkoper: UserRole.VERKOPER,
    boekhouding: UserRole.BOEKHOUDING
  },
  leadImportSourceToDb: {
    email: LeadImportSource.EMAIL,
    website: LeadImportSource.WEBSITE,
    facebook: LeadImportSource.FACEBOOK,
    google_ads: LeadImportSource.GOOGLE_ADS
  }
} as const;

function mapCustomer(customer: Prisma.CustomerGetPayload<object>): Customer {
  return {
    id: customer.id,
    name: customer.name,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    type: customerTypeFromDb(customer.type),
    notes: customer.notes,
    history: customer.history
  };
}

function mapLead(lead: Prisma.LeadGetPayload<object>): Lead {
  return {
    id: lead.id,
    title: lead.title,
    customerName: lead.customerName,
    source: crmLeadSourceFromDb(lead.source, lead.importSource),
    status: leadStatusFromDb(lead.status),
    priority: priorityFromDb(lead.priority),
    createdAt: dateOnly(lead.importedAt ?? lead.createdAt),
    notes: lead.notes,
    followUpTask: lead.followUpTask ?? undefined
  };
}

function mapProject(project: Prisma.ProjectGetPayload<object>): Project {
  return {
    id: project.id,
    title: project.title,
    customerId: project.customerId,
    leadId: project.leadId ?? undefined,
    type: projectTypeFromDb(project.type),
    status: projectStatusFromDb(project.status),
    startDate: dateOnly(project.startDate),
    endDate: project.endDate ? dateOnly(project.endDate) : undefined,
    budget: project.budget,
    notes: project.notes
  };
}

function mapQuote(quote: QuoteWithLines): Quote {
  return {
    id: quote.id,
    number: quote.number,
    customerId: quote.customerId,
    projectId: quote.projectId ?? undefined,
    status: quoteStatusFromDb(quote.status),
    createdAt: dateOnly(quote.createdAt),
    lines: quote.lines.map((line) => ({
      id: line.id,
      description: line.description,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
      vatRate: line.vatRate
    }))
  };
}

function mapInvoice(invoice: Prisma.InvoiceGetPayload<object>): Invoice {
  return {
    id: invoice.id,
    number: invoice.number,
    customerId: invoice.customerId,
    quoteId: invoice.quoteId ?? undefined,
    status: invoiceStatusFromDb(invoice.status),
    dueDate: dateOnly(invoice.dueDate),
    amount: invoice.amount
  };
}

function mapTask(task: Prisma.TaskGetPayload<object>): Task {
  return {
    id: task.id,
    title: task.title,
    deadline: dateOnly(task.deadline),
    status: taskStatusFromDb(task.status),
    relationType: taskRelationTypeFromDb(task.relationType),
    relationId: task.relationId
  };
}

function mapWorkOrder(workOrder: Prisma.WorkOrderGetPayload<object>): WorkOrder {
  return {
    id: workOrder.id,
    number: workOrder.number,
    customerId: workOrder.customerId,
    projectId: workOrder.projectId,
    executor: workOrder.executor,
    date: dateOnly(workOrder.date),
    description: workOrder.description,
    materials: workOrder.materials,
    hours: workOrder.hours,
    status: workOrderStatusFromDb(workOrder.status)
  };
}

function mapPlanningItem(item: PrismaPlanningItem): PlanningItem {
  return {
    id: item.id,
    title: item.title,
    customerId: item.customerId,
    projectId: item.projectId,
    workOrderId: item.workOrderId ?? undefined,
    mechanic: item.mechanic,
    date: dateOnly(item.date),
    startTime: item.startTime,
    endTime: item.endTime,
    address: item.address
  };
}

function mapProjectAsset(asset: Prisma.ProjectAssetGetPayload<object>): ProjectAsset {
  return {
    id: asset.id,
    projectId: asset.projectId,
    folder: projectAssetFolderFromDb(asset.folder),
    type: projectAssetTypeFromDb(asset.type),
    name: asset.name,
    size: asset.size,
    uploadedAt: dateOnly(asset.uploadedAt),
    previewUrl: asset.previewUrl ?? undefined
  };
}

function mapUser(user: Prisma.UserGetPayload<object>): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: userRoleFromDb(user.role)
  };
}

export function dateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

export function customerTypeFromDb(value: CustomerType): Customer["type"] {
  return reverse(enumMaps.customerTypeToDb, value);
}

export function leadStatusFromDb(value: LeadStatus): Lead["status"] {
  return reverse(enumMaps.leadStatusToDb, value);
}

export function priorityFromDb(value: Priority): Lead["priority"] {
  return reverse(enumMaps.priorityToDb, value);
}

export function projectTypeFromDb(value: ProjectType): Project["type"] {
  return reverse(enumMaps.projectTypeToDb, value);
}

export function projectStatusFromDb(value: ProjectStatus): Project["status"] {
  return reverse(enumMaps.projectStatusToDb, value);
}

export function quoteStatusFromDb(value: QuoteStatus): Quote["status"] {
  return reverse(enumMaps.quoteStatusToDb, value);
}

export function invoiceStatusFromDb(value: InvoiceStatus): Invoice["status"] {
  return reverse(enumMaps.invoiceStatusToDb, value);
}

export function taskStatusFromDb(value: TaskStatus): Task["status"] {
  return reverse(enumMaps.taskStatusToDb, value);
}

export function taskRelationTypeFromDb(value: TaskRelationType): Task["relationType"] {
  return reverse(enumMaps.taskRelationTypeToDb, value);
}

export function workOrderStatusFromDb(value: WorkOrderStatus): WorkOrder["status"] {
  return reverse(enumMaps.workOrderStatusToDb, value);
}

export function projectAssetFolderFromDb(value: ProjectAssetFolder): ProjectAsset["folder"] {
  return reverse(enumMaps.projectAssetFolderToDb, value);
}

export function projectAssetTypeFromDb(value: ProjectAssetType): ProjectAsset["type"] {
  return reverse(enumMaps.projectAssetTypeToDb, value);
}

export function userRoleFromDb(value: UserRole): User["role"] {
  return reverse(enumMaps.userRoleToDb, value);
}

export function importSourceFromDb(value: LeadImportSource) {
  return reverse(enumMaps.leadImportSourceToDb, value);
}

function crmLeadSourceFromDb(source: string, importSource: LeadImportSource | null): Lead["source"] {
  if (importSource === LeadImportSource.GOOGLE_ADS) return "Google Ads";
  if (importSource === LeadImportSource.FACEBOOK) return "Facebook";
  if (source === "Google Ads" || source === "Facebook" || source === "Marktplaats" || source === "website" || source === "telefonisch" || source === "via via") {
    return source;
  }
  return "website";
}

function reverse<T extends Record<string, string>, V extends T[keyof T]>(map: T, value: V) {
  const entry = Object.entries(map).find(([, dbValue]) => dbValue === value);
  return (entry?.[0] ?? "") as keyof T & string;
}
