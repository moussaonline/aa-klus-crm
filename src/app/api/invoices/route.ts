import { NextResponse } from "next/server";
import { invoices } from "@/data/seed";

export function GET() {
  return NextResponse.json(invoices);
}
