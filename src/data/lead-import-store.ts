import {
  detectLeadPriority,
  LeadImportLog,
  LeadImportPayload,
  makeLeadNote,
  normalizeEmail,
  normalizePhone,
  validateLeadImportPayload,
  ImportedLead
} from "@/domain/lead-import";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import path from "path";

interface LeadImportStoreData {
  leads: ImportedLead[];
  logs: LeadImportLog[];
}

const storePath = path.join(process.cwd(), "storage", "lead-import-state.json");

export function importLead(rawPayload: unknown) {
  const store = readStore();
  try {
    const payload = validateLeadImportPayload(rawPayload as Partial<LeadImportPayload>);
    const duplicate = findDuplicate(store.leads, payload);
    const now = new Date().toISOString();

    if (duplicate) {
      duplicate.updatedAt = now;
      duplicate.message = payload.message ?? duplicate.message;
      duplicate.projectType = payload.projectType ?? duplicate.projectType;
      duplicate.city = payload.city ?? duplicate.city;
      duplicate.budget = payload.budget ?? duplicate.budget;
      duplicate.preferredDate = payload.preferredDate ?? duplicate.preferredDate;
      duplicate.externalId = payload.externalId ?? duplicate.externalId;
      duplicate.priority = duplicate.priority === "hoog" ? "hoog" : detectLeadPriority(payload.message);
      duplicate.notes = [...duplicate.notes, ...makeLeadNote(payload)];
      if (payload.campaign && !duplicate.campaigns.includes(payload.campaign)) {
        duplicate.campaigns.push(payload.campaign);
      }

      const log = addLog(store, {
        source: payload.source,
        status: "duplicate",
        externalId: payload.externalId,
        rawPayload
      });
      writeStore(store);

      return { status: "duplicate" as const, lead: duplicate, log };
    }

    const lead: ImportedLead = {
      ...payload,
      id: `import_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      status: "nieuw",
      priority: detectLeadPriority(payload.message),
      notes: makeLeadNote(payload),
      campaigns: payload.campaign ? [payload.campaign] : [],
      importedAt: now,
      updatedAt: now
    };

    store.leads.unshift(lead);
    const log = addLog(store, {
      source: payload.source,
      status: "success",
      externalId: payload.externalId,
      rawPayload
    });
    writeStore(store);

    return { status: "success" as const, lead, log };
  } catch (error) {
    const partial = rawPayload as Partial<LeadImportPayload>;
    const log = addLog(store, {
      source: partial?.source ?? "unknown",
      status: "error",
      externalId: partial?.externalId,
      errorMessage: error instanceof Error ? error.message : "Onbekende importfout.",
      rawPayload
    });
    writeStore(store);

    return { status: "error" as const, error: log.errorMessage, log };
  }
}

export function getLeadImportState() {
  const store = readStore();
  return {
    leads: store.leads,
    logs: store.logs,
    sources: ["website", "email", "facebook", "google_ads"].map((source) => {
      const sourceLogs = store.logs.filter((log) => log.source === source);
      const today = new Date().toISOString().slice(0, 10);
      return {
        source,
        status: sourceLogs[0]?.status ?? "wacht op import",
        lastImport: sourceLogs[0]?.date,
        leadsToday: store.leads.filter((lead) => lead.source === source && lead.importedAt.startsWith(today)).length
      };
    })
  };
}

function findDuplicate(importedLeads: ImportedLead[], payload: LeadImportPayload) {
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);

  return importedLeads.find((lead) => {
    const sameExternalId = Boolean(payload.externalId && lead.externalId === payload.externalId);
    const sameEmail = Boolean(email && normalizeEmail(lead.email) === email);
    const samePhone = Boolean(phone && normalizePhone(lead.phone) === phone);
    return sameExternalId || sameEmail || samePhone;
  });
}

function addLog(store: LeadImportStoreData, input: Omit<LeadImportLog, "id" | "date">) {
  const log: LeadImportLog = {
    id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    date: new Date().toISOString(),
    ...input
  };
  store.logs.unshift(log);
  return log;
}

function readStore(): LeadImportStoreData {
  try {
    if (!existsSync(storePath)) {
      return { leads: [], logs: [] };
    }
    return JSON.parse(readFileSync(storePath, "utf8")) as LeadImportStoreData;
  } catch {
    return { leads: [], logs: [] };
  }
}

function writeStore(store: LeadImportStoreData) {
  mkdirSync(path.dirname(storePath), { recursive: true });
  writeFileSync(storePath, JSON.stringify(store, null, 2));
}
