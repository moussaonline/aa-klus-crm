import { NextResponse } from "next/server";
import { leads } from "@/data/seed";

export function GET() {
  return NextResponse.json(leads);
}
