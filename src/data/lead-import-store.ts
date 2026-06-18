import { LeadImportStatus, Prisma } from "@prisma/client";
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
import type { Lead } from "@/domain/models";
import { enumMaps, importSourceFromDb, priorityFromDb } from "@/data/crm-store";
import { prisma } from "@/lib/prisma";

export async function importLead(rawPayload: unknown) {
  try {
    const payload = validateLeadImportPayload(rawPayload as Partial<LeadImportPayload>);
    const duplicate = await findDuplicate(payload);
    const priority = detectLeadPriority(payload.message);

    if (duplicate) {
      const campaigns = payload.campaign && !duplicate.campaigns.includes(payload.campaign)
        ? [...duplicate.campaigns, payload.campaign]
        : duplicate.campaigns;
      const updatedNotes = [...splitNotes(duplicate.notes), ...makeLeadNote(payload)].join(" | ");

      const lead = await prisma.lead.update({
        where: { id: duplicate.id },
        data: {
          phone: payload.phone ?? duplicate.phone,
          email: payload.email ?? duplicate.email,
          source: leadSourceLabel(payload.source),
          importSource: enumMaps.leadImportSourceToDb[payload.source],
          message: payload.message ?? duplicate.message,
          projectType: payload.projectType ?? duplicate.projectType,
          city: payload.city ?? duplicate.city,
          budget: payload.budget ?? duplicate.budget,
          preferredDate: payload.preferredDate ?? duplicate.preferredDate,
          externalId: payload.externalId ?? duplicate.externalId,
          campaigns,
          priority: duplicate.priority === enumMaps.priorityToDb.hoog ? duplicate.priority : enumMaps.priorityToDb[priority],
          notes: updatedNotes
        }
      });

      const log = await addLog({
        source: payload.source,
        status: "duplicate",
        externalId: payload.externalId,
        rawPayload,
        leadId: lead.id
      });

      return { status: "duplicate" as const, lead: mapImportedLead(lead), log };
    }

    const now = new Date();
    const lead = await prisma.lead.create({
      data: {
        title: `${payload.projectType ?? "Nieuwe aanvraag"}${payload.city ? ` - ${payload.city}` : ""}`,
        customerName: payload.name,
        phone: payload.phone,
        email: payload.email,
        source: leadSourceLabel(payload.source),
        importSource: enumMaps.leadImportSourceToDb[payload.source],
        status: enumMaps.leadStatusToDb.nieuw,
        priority: enumMaps.priorityToDb[priority],
        followUpTask: priority === "hoog" ? "Spoedlead vandaag opvolgen" : null,
        notes: makeLeadNote(payload).join(" | "),
        message: payload.message,
        projectType: payload.projectType,
        city: payload.city,
        budget: payload.budget,
        preferredDate: payload.preferredDate,
        campaigns: payload.campaign ? [payload.campaign] : [],
        externalId: payload.externalId,
        importedAt: now,
        createdAt: now
      }
    });

    const log = await addLog({
      source: payload.source,
      status: "success",
      externalId: payload.externalId,
      rawPayload,
      leadId: lead.id
    });

    return { status: "success" as const, lead: mapImportedLead(lead), log };
  } catch (error) {
    const partial = rawPayload as Partial<LeadImportPayload>;
    const log = await addLog({
      source: partial?.source,
      status: "error",
      externalId: partial?.externalId,
      errorMessage: error instanceof Error ? error.message : "Onbekende importfout.",
      rawPayload
    });

    return { status: "error" as const, error: log.errorMessage, log };
  }
}

export async function getLeadImportState() {
  const [leads, logs] = await Promise.all([
    prisma.lead.findMany({
      where: { importSource: { not: null } },
      orderBy: [{ importedAt: "desc" }, { createdAt: "desc" }]
    }),
    prisma.leadImportLog.findMany({
      orderBy: { date: "desc" },
      take: 100
    })
  ]);

  return {
    leads: leads.map(mapImportedLead),
    logs: logs.map(mapImportLog),
    sources: ["website", "email", "facebook", "google_ads"].map((source) => {
      const sourceLogs = logs.filter((log) => log.source && importSourceFromDb(log.source) === source);
      const today = new Date().toISOString().slice(0, 10);
      return {
        source,
        status: sourceLogs[0] ? statusFromDb(sourceLogs[0].status) : "wacht op import",
        lastImport: sourceLogs[0]?.date.toISOString(),
        leadsToday: leads.filter((lead) => lead.importSource && importSourceFromDb(lead.importSource) === source && (lead.importedAt ?? lead.createdAt).toISOString().startsWith(today)).length
      };
    })
  };
}

export async function getImportedLeadsForCrm(): Promise<Lead[]> {
  const leads = await prisma.lead.findMany({
    where: { importSource: { not: null } },
    orderBy: [{ importedAt: "desc" }, { createdAt: "desc" }]
  });

  return leads.map((lead) => ({
    id: lead.id,
    title: lead.title,
    customerName: lead.customerName,
    source: leadSourceLabel(lead.importSource ? importSourceFromDb(lead.importSource) : "website"),
    status: "nieuw",
    priority: priorityFromDb(lead.priority),
    createdAt: (lead.importedAt ?? lead.createdAt).toISOString().slice(0, 10),
    notes: [
      lead.message,
      lead.email && `E-mail: ${lead.email}`,
      lead.phone && `Telefoon: ${lead.phone}`,
      lead.budget && `Budget: ${lead.budget}`,
      lead.preferredDate && `Gewenste datum: ${lead.preferredDate}`,
      lead.campaigns.length > 0 && `Campagnes: ${lead.campaigns.join(", ")}`
    ].filter(Boolean).join(" | "),
    followUpTask: lead.priority === enumMaps.priorityToDb.hoog ? "Spoedlead vandaag opvolgen" : undefined
  }));
}

async function findDuplicate(payload: LeadImportPayload) {
  const email = normalizeEmail(payload.email);
  const phone = normalizePhone(payload.phone);

  const candidates = await prisma.lead.findMany({
    where: {
      OR: [
        ...(payload.externalId ? [{ externalId: payload.externalId }] : []),
        ...(email ? [{ email: { equals: email, mode: "insensitive" as const } }] : []),
        ...(phone ? [{ phone: { not: null } }] : [])
      ]
    }
  });

  return candidates.find((lead) => {
    const sameExternalId = Boolean(payload.externalId && lead.externalId === payload.externalId);
    const sameEmail = Boolean(email && normalizeEmail(lead.email ?? undefined) === email);
    const samePhone = Boolean(phone && normalizePhone(lead.phone ?? undefined) === phone);
    return sameExternalId || sameEmail || samePhone;
  });
}

async function addLog(input: {
  source?: string;
  status: "success" | "duplicate" | "error";
  externalId?: string;
  errorMessage?: string;
  rawPayload: unknown;
  leadId?: string;
}) {
  const log = await prisma.leadImportLog.create({
    data: {
      source: input.source && input.source in enumMaps.leadImportSourceToDb
        ? enumMaps.leadImportSourceToDb[input.source as keyof typeof enumMaps.leadImportSourceToDb]
        : null,
      status: statusToDb(input.status),
      externalId: input.externalId,
      errorMessage: input.errorMessage,
      rawPayload: toJson(input.rawPayload),
      leadId: input.leadId
    }
  });

  return mapImportLog(log);
}

function mapImportedLead(lead: Prisma.LeadGetPayload<object>): ImportedLead {
  const source = lead.importSource ? importSourceFromDb(lead.importSource) : "website";
  return {
    id: lead.id,
    name: lead.customerName,
    phone: lead.phone ?? undefined,
    email: lead.email ?? undefined,
    source,
    message: lead.message ?? undefined,
    projectType: lead.projectType ?? undefined,
    city: lead.city ?? undefined,
    budget: lead.budget ?? undefined,
    preferredDate: lead.preferredDate ?? undefined,
    campaign: lead.campaigns[0],
    externalId: lead.externalId ?? undefined,
    status: "nieuw",
    priority: importedPriorityFromDb(lead.priority),
    notes: splitNotes(lead.notes),
    campaigns: lead.campaigns,
    importedAt: (lead.importedAt ?? lead.createdAt).toISOString(),
    updatedAt: lead.updatedAt.toISOString()
  };
}

function mapImportLog(log: Prisma.LeadImportLogGetPayload<object>): LeadImportLog {
  return {
    id: log.id,
    date: log.date.toISOString(),
    source: log.source ? importSourceFromDb(log.source) : "unknown",
    status: statusFromDb(log.status),
    externalId: log.externalId ?? undefined,
    errorMessage: log.errorMessage ?? undefined,
    rawPayload: log.rawPayload
  };
}

function leadSourceLabel(source: LeadImportPayload["source"]): Lead["source"] {
  if (source === "google_ads") return "Google Ads";
  if (source === "facebook") return "Facebook";
  return "website";
}

function statusToDb(status: "success" | "duplicate" | "error") {
  return {
    success: LeadImportStatus.SUCCESS,
    duplicate: LeadImportStatus.DUPLICATE,
    error: LeadImportStatus.ERROR
  }[status];
}

function statusFromDb(status: LeadImportStatus): LeadImportLog["status"] {
  return {
    [LeadImportStatus.SUCCESS]: "success",
    [LeadImportStatus.DUPLICATE]: "duplicate",
    [LeadImportStatus.ERROR]: "error"
  }[status] as LeadImportLog["status"];
}

function importedPriorityFromDb(priority: Prisma.LeadGetPayload<object>["priority"]): ImportedLead["priority"] {
  return priorityFromDb(priority) === "hoog" ? "hoog" : "normaal";
}

function splitNotes(notes: string) {
  return notes.split(" | ").filter(Boolean);
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value ?? null)) as Prisma.InputJsonValue;
}
