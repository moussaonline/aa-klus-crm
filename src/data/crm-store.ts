import { customers, invoices, leads, planningItems, projectAssets, projects, quotes, tasks, users, workOrders } from "./seed";
import { getImportedLeadsForCrm } from "./lead-import-store";

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

export function getCrmData(): CrmSeed {
  return {
    ...crmSeed,
    leads: [...getImportedLeadsForCrm(), ...leads]
  };
}
