import { NextResponse } from "next/server";
import { planningItems } from "@/data/seed";

export function GET() {
  return NextResponse.json(planningItems);
}
