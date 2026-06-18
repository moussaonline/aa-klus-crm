import { NextResponse } from "next/server";
import { quotes } from "@/data/seed";

export function GET() {
  return NextResponse.json(quotes);
}
