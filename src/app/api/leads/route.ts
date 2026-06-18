import { NextResponse } from "next/server";
import { leads } from "@/data/seed";
import { getImportedLeadsForCrm } from "@/data/lead-import-store";

export function GET() {
  return NextResponse.json([...getImportedLeadsForCrm(), ...leads]);
}
