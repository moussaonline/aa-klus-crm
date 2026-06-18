import { NextRequest, NextResponse } from "next/server";
import { getLeadImportState, importLead } from "@/data/lead-import-store";

const developmentImportKey = "dev-import-key";

export function GET() {
  return NextResponse.json(getLeadImportState());
}

export async function POST(request: NextRequest) {
  const expectedKey = process.env.IMPORT_API_KEY ?? developmentImportKey;
  const providedKey = request.headers.get("x-api-key");

  if (!providedKey || providedKey !== expectedKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const result = importLead(payload);

  if (result.status === "error") {
    return NextResponse.json(result, { status: 400 });
  }

  return NextResponse.json(result, { status: result.status === "duplicate" ? 200 : 201 });
}
