import { NextRequest, NextResponse } from "next/server";
import { customers, invoices, projects, quotes, workOrders } from "@/data/seed";
import { requireApiLogin } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  const unauthorized = await requireApiLogin();
  if (unauthorized) return unauthorized;

  const term = request.nextUrl.searchParams.get("q")?.toLowerCase() ?? "";

  if (!term) {
    return NextResponse.json([]);
  }

  const results = [
    ...customers
      .filter((customer) => [customer.name, customer.phone, customer.email, customer.city].some((value) => value.toLowerCase().includes(term)))
      .map((customer) => ({ type: "customer", id: customer.id, label: customer.name })),
    ...projects
      .filter((project) => project.title.toLowerCase().includes(term))
      .map((project) => ({ type: "project", id: project.id, label: project.title })),
    ...quotes
      .filter((quote) => quote.number.toLowerCase().includes(term))
      .map((quote) => ({ type: "quote", id: quote.id, label: quote.number })),
    ...invoices
      .filter((invoice) => invoice.number.toLowerCase().includes(term))
      .map((invoice) => ({ type: "invoice", id: invoice.id, label: invoice.number })),
    ...workOrders
      .filter((workOrder) => workOrder.number.toLowerCase().includes(term))
      .map((workOrder) => ({ type: "workOrder", id: workOrder.id, label: workOrder.number }))
  ];

  return NextResponse.json(results);
}
