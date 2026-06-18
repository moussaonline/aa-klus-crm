import { NextResponse } from "next/server";
import { tasks } from "@/data/seed";

export function GET() {
  return NextResponse.json(tasks);
}
