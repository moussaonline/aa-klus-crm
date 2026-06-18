export type LeadImportSource = "email" | "website" | "facebook" | "google_ads";
export type LeadImportStatus = "success" | "duplicate" | "error";

export interface LeadImportPayload {
  name: string;
  phone?: string;
  email?: string;
  source: LeadImportSource;
  message?: string;
  projectType?: string;
  city?: string;
  budget?: string;
  preferredDate?: string;
  campaign?: string;
  externalId?: string;
}

export interface ImportedLead extends LeadImportPayload {
  id: string;
  status: "nieuw";
  priority: "normaal" | "hoog";
  notes: string[];
  campaigns: string[];
  importedAt: string;
  updatedAt: string;
}

export interface LeadImportLog {
  id: string;
  date: string;
  source: LeadImportSource | "unknown";
  status: LeadImportStatus;
  externalId?: string;
  errorMessage?: string;
  rawPayload: unknown;
}

export interface FacebookLeadPayload {
  full_name?: string;
  phone_number?: string;
  email?: string;
  city?: string;
  project_type?: string;
  budget?: string;
  campaign?: string;
  externalId?: string;
  id?: string;
}

export interface GoogleAdsLeadPayload {
  user_column_data?: Array<{ column_name?: string; string_value?: string; value?: string }>;
  full_name?: string;
  phone_number?: string;
  email?: string;
  postal_code?: string;
  city?: string;
  campaign?: string;
  externalId?: string;
  lead_id?: string;
}

const allowedSources: LeadImportSource[] = ["email", "website", "facebook", "google_ads"];
const urgentWords = ["spoed", "dringend", "lekkage", "vandaag"];

export function isLeadImportSource(value: unknown): value is LeadImportSource {
  return typeof value === "string" && allowedSources.includes(value as LeadImportSource);
}

export function detectLeadPriority(message = ""): "normaal" | "hoog" {
  const lower = message.toLowerCase();
  return urgentWords.some((word) => lower.includes(word)) ? "hoog" : "normaal";
}

export function normalizePhone(value?: string) {
  return value?.replace(/\D/g, "") ?? "";
}

export function normalizeEmail(value?: string) {
  return value?.trim().toLowerCase() ?? "";
}

export function validateLeadImportPayload(payload: Partial<LeadImportPayload>): LeadImportPayload {
  if (!payload.name || typeof payload.name !== "string") {
    throw new Error("Naam is verplicht.");
  }

  if (!isLeadImportSource(payload.source)) {
    throw new Error("Ongeldige leadbron.");
  }

  if (!payload.email && !payload.phone && !payload.externalId) {
    throw new Error("Minimaal e-mail, telefoon of externalId is verplicht voor duplicate-detectie.");
  }

  return {
    name: payload.name.trim(),
    phone: payload.phone?.trim(),
    email: payload.email?.trim(),
    source: payload.source,
    message: payload.message?.trim(),
    projectType: payload.projectType?.trim(),
    city: payload.city?.trim(),
    budget: payload.budget?.trim(),
    preferredDate: payload.preferredDate?.trim(),
    campaign: payload.campaign?.trim(),
    externalId: payload.externalId?.trim()
  };
}

export function mapFacebookLeadToCRMLead(payload: FacebookLeadPayload): LeadImportPayload {
  return validateLeadImportPayload({
    name: payload.full_name ?? "",
    phone: payload.phone_number,
    email: payload.email,
    source: "facebook",
    city: payload.city,
    projectType: payload.project_type,
    budget: payload.budget,
    campaign: payload.campaign,
    externalId: payload.externalId ?? payload.id,
    message: payload.project_type ? `Facebook aanvraag voor ${payload.project_type}` : "Facebook Lead Ads aanvraag"
  });
}

export function mapGoogleAdsLeadToCRMLead(payload: GoogleAdsLeadPayload): LeadImportPayload {
  const fields = Object.fromEntries(
    (payload.user_column_data ?? []).map((item) => [
      normalizeGoogleField(item.column_name),
      item.string_value ?? item.value ?? ""
    ])
  );

  return validateLeadImportPayload({
    name: payload.full_name ?? fields.full_name ?? fields.name ?? "",
    phone: payload.phone_number ?? fields.phone_number ?? fields.phone,
    email: payload.email ?? fields.email,
    source: "google_ads",
    city: payload.city ?? fields.city ?? fields.postal_code ?? payload.postal_code,
    projectType: fields.project_type,
    budget: fields.budget,
    campaign: payload.campaign,
    externalId: payload.externalId ?? payload.lead_id ?? fields.lead_id,
    message: "Google Ads leadformulier aanvraag"
  });
}

export function parseLeadEmail(text: string): LeadImportPayload {
  const values = parseKeyValueText(text);
  return validateLeadImportPayload({
    name: values.naam ?? values.name ?? "",
    phone: values.telefoon ?? values.phone,
    email: values["e-mail"] ?? values.email,
    source: "email",
    city: values.plaats ?? values.city,
    projectType: values.project,
    budget: values.budget,
    message: values.bericht ?? values.message,
    externalId: values.externalid ?? values.external_id,
    campaign: values.campaign
  });
}

export function makeLeadNote(payload: LeadImportPayload) {
  return [
    payload.message && `Bericht: ${payload.message}`,
    payload.projectType && `Project: ${payload.projectType}`,
    payload.city && `Plaats: ${payload.city}`,
    payload.budget && `Budget: ${payload.budget}`,
    payload.preferredDate && `Gewenste datum: ${payload.preferredDate}`,
    payload.campaign && `Campagne: ${payload.campaign}`
  ].filter(Boolean) as string[];
}

function parseKeyValueText(text: string) {
  return text.split(/\r?\n/).reduce<Record<string, string>>((result, line) => {
    const index = line.indexOf(":");
    if (index === -1) return result;
    const key = line.slice(0, index).trim().toLowerCase();
    const value = line.slice(index + 1).trim();
    if (key && value) result[key] = value;
    return result;
  }, {});
}

function normalizeGoogleField(value = "") {
  return value.toLowerCase().trim().replace(/\s+/g, "_");
}
