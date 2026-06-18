import { NextResponse } from "next/server";
import { getCrmData } from "@/data/crm-store";
import { requireApiLogin } from "@/lib/server-auth";

export async function GET() {
  const unauthorized = await requireApiLogin();
  if (unauthorized) return unauthorized;
  const data = await getCrmData();
  return NextResponse.json(data.quotes);
}
