import { CrmApp } from "@/components/crm/crm-app";
import { getCrmData } from "@/data/crm-store";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return <CrmApp initialData={getCrmData()} />;
}
