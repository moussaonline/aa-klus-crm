import { CrmApp } from "@/components/crm/crm-app";
import { crmSeed } from "@/data/crm-store";

export default function DashboardPage() {
  return <CrmApp initialData={crmSeed} />;
}
