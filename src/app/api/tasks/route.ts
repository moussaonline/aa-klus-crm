import { NextResponse } from "next/server";
import { tasks } from "@/data/seed";
import { requireApiLogin } from "@/lib/server-auth";

export async function GET() {
  const unauthorized = await requireApiLogin();
  if (unauthorized) return unauthorized;
  return NextResponse.json(tasks);
}
