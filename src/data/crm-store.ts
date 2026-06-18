import { customers, invoices, leads, planningItems, projectAssets, projects, quotes, tasks, users, workOrders } from "./seed";

export const crmSeed = {
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
};

export type CrmSeed = typeof crmSeed;
