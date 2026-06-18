import { NextResponse } from "next/server";
import { customers } from "@/data/seed";

export function GET() {
  return NextResponse.json(customers);
}
