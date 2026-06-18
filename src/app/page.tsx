import { CrmApp } from "@/components/crm/crm-app";
import { getCrmData } from "@/data/crm-store";
import { requireCrmLogin } from "@/lib/server-auth";

export const dynamic = "force-dynamic";

export default async function Home() {
  await requireCrmLogin("/");
  return <CrmApp initialData={await getCrmData()} />;
}
