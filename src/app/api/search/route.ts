import { NextRequest, NextResponse } from "next/server";
import { getSearchResults } from "@/data/crm-store";
import { requireApiLogin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const unauthorized = await requireApiLogin();
  if (unauthorized) return unauthorized;

  const term = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";

  if (!term) {
    return NextResponse.json([]);
  }

  return NextResponse.json(await getSearchResults(term));
}
