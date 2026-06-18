import { NextResponse } from "next/server";
import { projects } from "@/data/seed";

export function GET() {
  return NextResponse.json(projects);
}
