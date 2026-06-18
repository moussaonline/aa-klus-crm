import { PrismaClient } from "@prisma/client";
import { customers, invoices, leads, planningItems, projectAssets, projects, quotes, tasks, users, workOrders } from "../src/data/seed";

const prisma = new PrismaClient();

const customerTypeToDb = {
  particulier: "PARTICULIER",
  aannemer: "AANNEMER",
  vastgoedbeheerder: "VASTGOEDBEHEERDER",
  bedrijf: "BEDRIJF"
} as const;

const leadStatusToDb = {
  nieuw: "NIEUW",
  "contact opgenomen": "CONTACT_OPGENOMEN",
  "afspraak gepland": "AFSPRAAK_GEPLAND",
  "offerte verstuurd": "OFFERTE_VERSTUURD",
  gewonnen: "GEWONNEN",
  verloren: "VERLOREN"
} as const;

const priorityToDb = {
  laag: "LAAG",
  normaal: "NORMAAL",
  hoog: "HOOG"
} as const;

const projectTypeToDb = {
  badkamer: "BADKAMER",
  zolder: "ZOLDER",
  renovatie: "RENOVATIE",
  schilderwerk: "SCHILDERWERK",
  stucwerk: "STUCWERK",
  vloer: "VLOER",
  keuken: "KEUKEN",
  onderhoud: "ONDERHOUD",
  overig: "OVERIG"
} as const;

const projectStatusToDb = {
  intake: "INTAKE",
  offerte: "OFFERTE",
  gepland: "GEPLAND",
  bezig: "BEZIG",
  afgerond: "AFGEROND",
  geannuleerd: "GEANNULEERD"
} as const;

const quoteStatusToDb = {
  concept: "CONCEPT",
  verzonden: "VERZONDEN",
  geaccepteerd: "GEACCEPTEERD",
  afgewezen: "AFGEWEZEN"
} as const;

const invoiceStatusToDb = {
  concept: "CONCEPT",
  verzonden: "VERZONDEN",
  betaald: "BETAALD",
  "te laat": "TE_LAAT"
} as const;

const taskStatusToDb = {
  open: "OPEN",
  bezig: "BEZIG",
  afgerond: "AFGEROND"
} as const;

const taskRelationTypeToDb = {
  klant: "KLANT",
  lead: "LEAD",
  project: "PROJECT"
} as const;

const workOrderStatusToDb = {
  concept: "CONCEPT",
  "in uitvoering": "IN_UITVOERING",
  gereed: "GEREED",
  gefactureerd: "GEFACTUREERD"
} as const;

const projectAssetFolderToDb = {
  "voor foto's": "VOOR_FOTOS",
  "na foto's": "NA_FOTOS",
  documenten: "DOCUMENTEN"
} as const;

const projectAssetTypeToDb = {
  foto: "FOTO",
  pdf: "PDF",
  contract: "CONTRACT",
  factuur: "FACTUUR"
} as const;

const userRoleToDb = {
  "eigenaar/admin": "ADMIN",
  medewerker: "MEDEWERKER",
  verkoper: "VERKOPER",
  boekhouding: "BOEKHOUDING"
} as const;

async function main() {
  await prisma.$transaction([
    prisma.leadImportLog.deleteMany(),
    prisma.planningItem.deleteMany(),
    prisma.projectAsset.deleteMany(),
    prisma.workOrder.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.quoteLine.deleteMany(),
    prisma.quote.deleteMany(),
    prisma.task.deleteMany(),
    prisma.project.deleteMany(),
    prisma.lead.deleteMany(),
    prisma.customer.deleteMany(),
    prisma.user.deleteMany()
  ]);

  await prisma.customer.createMany({
    data: customers.map((customer) => ({
      id: customer.id,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address,
      city: customer.city,
      type: customerTypeToDb[customer.type],
      notes: customer.notes,
      history: customer.history
    }))
  });

  await prisma.lead.createMany({
    data: leads.map((lead) => ({
      id: lead.id,
      title: lead.title,
      customerName: lead.customerName,
      source: lead.source,
      status: leadStatusToDb[lead.status],
      priority: priorityToDb[lead.priority],
      notes: lead.notes,
      followUpTask: lead.followUpTask,
      createdAt: dateFromInput(lead.createdAt)
    }))
  });

  await prisma.project.createMany({
    data: projects.map((project) => ({
      id: project.id,
      title: project.title,
      customerId: project.customerId,
      leadId: project.leadId,
      type: projectTypeToDb[project.type],
      status: projectStatusToDb[project.status],
      startDate: dateFromInput(project.startDate),
      endDate: project.endDate ? dateFromInput(project.endDate) : null,
      budget: project.budget,
      notes: project.notes
    }))
  });

  for (const quote of quotes) {
    await prisma.quote.create({
      data: {
        id: quote.id,
        number: quote.number,
        customerId: quote.customerId,
        projectId: quote.projectId,
        status: quoteStatusToDb[quote.status],
        createdAt: dateFromInput(quote.createdAt),
        lines: {
          create: quote.lines.map((line) => ({
            id: line.id,
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            vatRate: line.vatRate
          }))
        }
      }
    });
  }

  await prisma.invoice.createMany({
    data: invoices.map((invoice) => ({
      id: invoice.id,
      number: invoice.number,
      customerId: invoice.customerId,
      quoteId: invoice.quoteId,
      status: invoiceStatusToDb[invoice.status],
      dueDate: dateFromInput(invoice.dueDate),
      amount: invoice.amount
    }))
  });

  await prisma.task.createMany({
    data: tasks.map((task) => ({
      id: task.id,
      title: task.title,
      deadline: dateFromInput(task.deadline),
      status: taskStatusToDb[task.status],
      relationType: taskRelationTypeToDb[task.relationType],
      relationId: task.relationId,
      customerId: task.relationType === "klant" ? task.relationId : null,
      leadId: task.relationType === "lead" ? task.relationId : null,
      projectId: task.relationType === "project" ? task.relationId : null
    }))
  });

  await prisma.workOrder.createMany({
    data: workOrders.map((workOrder) => ({
      id: workOrder.id,
      number: workOrder.number,
      customerId: workOrder.customerId,
      projectId: workOrder.projectId,
      executor: workOrder.executor,
      date: dateFromInput(workOrder.date),
      description: workOrder.description,
      materials: workOrder.materials,
      hours: workOrder.hours,
      status: workOrderStatusToDb[workOrder.status]
    }))
  });

  await prisma.planningItem.createMany({
    data: planningItems.map((item) => ({
      id: item.id,
      title: item.title,
      customerId: item.customerId,
      projectId: item.projectId,
      workOrderId: item.workOrderId,
      mechanic: item.mechanic,
      date: dateFromInput(item.date),
      startTime: item.startTime,
      endTime: item.endTime,
      address: item.address
    }))
  });

  await prisma.projectAsset.createMany({
    data: projectAssets.map((asset) => ({
      id: asset.id,
      projectId: asset.projectId,
      folder: projectAssetFolderToDb[asset.folder],
      type: projectAssetTypeToDb[asset.type],
      name: asset.name,
      size: asset.size,
      uploadedAt: dateFromInput(asset.uploadedAt),
      previewUrl: asset.previewUrl
    }))
  });

  await prisma.user.createMany({
    data: users.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: userRoleToDb[user.role]
    }))
  });

  console.log("AA Klus CRM PostgreSQL seeddata is klaar.");
}

function dateFromInput(value: string) {
  return new Date(`${value}T00:00:00.000Z`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
