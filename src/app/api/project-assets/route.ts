import { NextResponse } from "next/server";
import { projectAssets } from "@/data/seed";

export function GET() {
  return NextResponse.json(projectAssets);
}
