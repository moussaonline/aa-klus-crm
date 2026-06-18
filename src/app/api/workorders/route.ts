import { NextResponse } from "next/server";
import { workOrders } from "@/data/seed";

export function GET() {
  return NextResponse.json(workOrders);
}
