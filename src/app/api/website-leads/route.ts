import { NextRequest, NextResponse } from "next/server";

const developmentImportKey = "dev-import-key";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const origin = request.nextUrl.origin;
  const importKey = process.env.IMPORT_API_KEY ?? developmentImportKey;

  const payload = {
    name: body.name,
    phone: body.phone,
    email: body.email,
    source: "website",
    message: body.message,
    projectType: body.projectType,
    city: body.city,
    budget: body.budget,
    preferredDate: body.preferredDate,
    campaign: body.campaign ?? "AA Klus websiteformulier",
    externalId: body.externalId ?? `website-${body.email ?? body.phone ?? Date.now()}`
  };

  const response = await fetch(`${origin}/api/leads/import`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": importKey
    },
    body: JSON.stringify(payload)
  });

  const result = await response.json();

  if (!response.ok) {
    return NextResponse.json(
      { message: result.error ?? "Verzenden is mislukt. Probeer het later opnieuw." },
      { status: response.status }
    );
  }

  return NextResponse.json({
    status: result.status,
    message: result.status === "duplicate"
      ? "Je aanvraag stond al in ons systeem. We hebben je bericht bijgewerkt."
      : "Bedankt. Je aanvraag is ontvangen door AA Klus.",
    lead: result.lead
  });
}
