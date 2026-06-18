import { NextResponse } from "next/server";
import { leads } from "@/data/seed";
import { getImportedLeadsForCrm } from "@/data/lead-import-store";
import { requireApiLogin } from "@/lib/server-auth";

export async function GET() {
  const unauthorized = await requireApiLogin();
  if (unauthorized) return unauthorized;
  return NextResponse.json([...getImportedLeadsForCrm(), ...leads]);
}
