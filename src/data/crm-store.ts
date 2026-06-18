import { customers, invoices, leads, projects, quotes, tasks, users } from "./seed";

export const crmSeed = {
  customers,
  leads,
  projects,
  quotes,
  invoices,
  tasks,
  users
};

export type CrmSeed = typeof crmSeed;
