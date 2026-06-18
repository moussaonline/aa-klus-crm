import { CrmApp } from "@/components/crm/crm-app";
import { crmSeed } from "@/data/crm-store";

export default function Home() {
  return <CrmApp initialData={crmSeed} />;
}
