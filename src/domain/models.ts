export type CustomerType = "particulier" | "aannemer" | "vastgoedbeheerder" | "bedrijf";
export type LeadStatus = "nieuw" | "contact opgenomen" | "afspraak gepland" | "offerte verstuurd" | "gewonnen" | "verloren";
export type Priority = "laag" | "normaal" | "hoog";
export type ProjectType = "badkamer" | "zolder" | "renovatie" | "schilderwerk" | "stucwerk" | "vloer" | "keuken" | "onderhoud" | "overig";
export type ProjectStatus = "intake" | "offerte" | "gepland" | "bezig" | "afgerond" | "geannuleerd";
export type QuoteStatus = "concept" | "verzonden" | "geaccepteerd" | "afgewezen";
export type InvoiceStatus = "concept" | "verzonden" | "betaald" | "te laat";
export type TaskStatus = "open" | "bezig" | "afgerond";
export type UserRole = "eigenaar/admin" | "medewerker" | "verkoper" | "boekhouding";
export type WorkOrderStatus = "concept" | "in uitvoering" | "gereed" | "gefactureerd";
export type PlanningView = "dag" | "week" | "maand";
export type ProjectAssetFolder = "voor foto's" | "na foto's" | "documenten";
export type ProjectAssetType = "foto" | "pdf" | "contract" | "factuur";

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  type: CustomerType;
  notes: string;
  history: string[];
}

export interface Lead {
  id: string;
  title: string;
  customerName: string;
  source: "Facebook" | "Google Ads" | "Marktplaats" | "website" | "telefonisch" | "via via";
  status: LeadStatus;
  priority: Priority;
  createdAt: string;
  notes: string;
  followUpTask?: string;
}

export interface Project {
  id: string;
  title: string;
  customerId: string;
  leadId?: string;
  type: ProjectType;
  status: ProjectStatus;
  startDate: string;
  endDate?: string;
  budget: number;
  notes: string;
}

export interface WorkOrder {
  id: string;
  number: string;
  customerId: string;
  projectId: string;
  executor: string;
  date: string;
  description: string;
  materials: string;
  hours: number;
  status: WorkOrderStatus;
}

export interface PlanningItem {
  id: string;
  title: string;
  customerId: string;
  projectId: string;
  workOrderId?: string;
  mechanic: string;
  date: string;
  startTime: string;
  endTime: string;
  address: string;
}

export interface ProjectAsset {
  id: string;
  projectId: string;
  folder: ProjectAssetFolder;
  type: ProjectAssetType;
  name: string;
  size: number;
  uploadedAt: string;
  previewUrl?: string;
}

export interface QuoteLine {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  vatRate: number;
}

export interface Quote {
  id: string;
  number: string;
  customerId: string;
  projectId?: string;
  status: QuoteStatus;
  createdAt: string;
  lines: QuoteLine[];
}

export interface Invoice {
  id: string;
  number: string;
  customerId: string;
  quoteId?: string;
  status: InvoiceStatus;
  dueDate: string;
  amount: number;
}

export interface Task {
  id: string;
  title: string;
  deadline: string;
  status: TaskStatus;
  relationType: "klant" | "lead" | "project";
  relationId: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}
