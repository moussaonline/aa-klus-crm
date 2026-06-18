import { LeadImportApp } from "@/components/crm/lead-import-app";
import { requireCrmLogin } from "@/lib/server-auth";

export default async function LeadImportPage() {
  await requireCrmLogin("/lead-import");
  return <LeadImportApp />;
}
