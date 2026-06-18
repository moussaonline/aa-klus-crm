import { formatEuro, quoteTotals } from "./finance";
import type { Customer, Invoice, Project, Quote, WorkOrder } from "./models";

const company = {
  name: "AA Klus",
  line1: "Renovatie, onderhoud en maatwerk",
  phone: "06 12 34 56 78",
  email: "info@aaklus.nl",
  address: "Amsterdam en omgeving"
};

function escapeHtml(value: string | number | undefined) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function openPdfWindow(title: string, body: string) {
  const html = `<!doctype html>
<html lang="nl">
<head>
  <meta charset="utf-8" />
  <title>${escapeHtml(title)}</title>
  <style>
    body { margin: 0; background: #eef3ef; color: #17211d; font-family: Arial, sans-serif; }
    .page { width: 794px; min-height: 1123px; margin: 24px auto; background: white; padding: 48px; box-shadow: 0 18px 50px rgba(15, 68, 54, .12); }
    .top { display: flex; justify-content: space-between; gap: 32px; border-bottom: 4px solid #12674d; padding-bottom: 24px; }
    .logo { width: 72px; height: 72px; border-radius: 12px; background: #12674d; color: white; display: grid; place-items: center; font-weight: 800; font-size: 24px; }
    h1 { margin: 0; color: #0f4436; font-size: 30px; }
    h2 { color: #12674d; margin-top: 30px; }
    table { width: 100%; border-collapse: collapse; margin-top: 18px; }
    th { text-align: left; background: #edfdf4; color: #0f4436; }
    th, td { padding: 11px; border-bottom: 1px solid #dbe5df; font-size: 14px; }
    .muted { color: #66736d; font-size: 13px; line-height: 1.5; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-top: 24px; }
    .box { border: 1px solid #dbe5df; border-radius: 8px; padding: 16px; }
    .total { margin-top: 20px; margin-left: auto; width: 320px; }
    .total div { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #dbe5df; }
    .grand { font-size: 20px; color: #0f4436; font-weight: 800; }
    @media print { body { background: white; } .page { margin: 0; box-shadow: none; width: auto; min-height: auto; } .no-print { display: none; } }
  </style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div style="display:flex; gap:16px; align-items:center;">
        <div class="logo">AA</div>
        <div>
          <h1>${escapeHtml(company.name)}</h1>
          <p class="muted">${escapeHtml(company.line1)}<br>${escapeHtml(company.address)}<br>${escapeHtml(company.phone)} - ${escapeHtml(company.email)}</p>
        </div>
      </div>
      <button class="no-print" onclick="window.print()" style="height:40px;padding:0 16px;border:0;border-radius:6px;background:#12674d;color:white;font-weight:700;">PDF opslaan</button>
    </div>
    ${body}
  </div>
</body>
</html>`;

  const win = window.open("", "_blank", "noopener,noreferrer");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
}

export function exportWorkOrderPdf(workOrder: WorkOrder, customer?: Customer, project?: Project) {
  openPdfWindow(
    `Werkbon ${workOrder.number}`,
    `<div class="grid">
      <div class="box"><strong>Werkbon</strong><p>${escapeHtml(workOrder.number)}<br>Status: ${escapeHtml(workOrder.status)}<br>Datum: ${escapeHtml(workOrder.date)}<br>Uitvoerder: ${escapeHtml(workOrder.executor)}</p></div>
      <div class="box"><strong>Klant en project</strong><p>${escapeHtml(customer?.name)}<br>${escapeHtml(customer?.address)}, ${escapeHtml(customer?.city)}<br>${escapeHtml(project?.title)}</p></div>
    </div>
    <h2>Werkzaamheden</h2><p>${escapeHtml(workOrder.description)}</p>
    <h2>Materialen en uren</h2>
    <table><tr><th>Gebruikte materialen</th><th>Gewerkte uren</th></tr><tr><td>${escapeHtml(workOrder.materials)}</td><td>${escapeHtml(workOrder.hours)}</td></tr></table>
    <p class="muted" style="margin-top:40px;">Handtekening klant: ________________________________</p>`
  );
}

export function exportQuotePdf(quote: Quote, customer?: Customer, project?: Project) {
  const totals = quoteTotals(quote.lines);
  openPdfWindow(
    `Offerte ${quote.number}`,
    `<div class="grid">
      <div class="box"><strong>Offerte</strong><p>${escapeHtml(quote.number)}<br>Datum: ${escapeHtml(quote.createdAt)}<br>Status: ${escapeHtml(quote.status)}</p></div>
      <div class="box"><strong>Klant</strong><p>${escapeHtml(customer?.name)}<br>${escapeHtml(customer?.address)}, ${escapeHtml(customer?.city)}<br>${escapeHtml(customer?.email)}</p></div>
    </div>
    <h2>${escapeHtml(project?.title ?? "Werkzaamheden")}</h2>
    <table><thead><tr><th>Omschrijving</th><th>Aantal</th><th>Prijs</th><th>BTW</th><th>Totaal</th></tr></thead><tbody>
      ${quote.lines.map((line) => `<tr><td>${escapeHtml(line.description)}</td><td>${line.quantity}</td><td>${formatEuro(line.unitPrice)}</td><td>${line.vatRate}%</td><td>${formatEuro(line.quantity * line.unitPrice * (1 + line.vatRate / 100))}</td></tr>`).join("")}
    </tbody></table>
    <div class="total"><div><span>Subtotaal</span><strong>${formatEuro(totals.subtotal)}</strong></div><div><span>BTW</span><strong>${formatEuro(totals.vat)}</strong></div><div class="grand"><span>Totaal</span><span>${formatEuro(totals.total)}</span></div></div>
    <p class="muted">Deze offerte is 30 dagen geldig. Alle bedragen zijn inclusief specificatie volgens de groene AA Klus huisstijl.</p>`
  );
}

export function exportInvoicePdf(invoice: Invoice, customer?: Customer, quote?: Quote) {
  const quoteTotal = quote ? quoteTotals(quote.lines).total : invoice.amount;
  const paid = invoice.status === "betaald" ? quoteTotal : 0;
  const open = Math.max(quoteTotal - paid, 0);
  openPdfWindow(
    `Factuur ${invoice.number}`,
    `<div class="grid">
      <div class="box"><strong>Factuur</strong><p>${escapeHtml(invoice.number)}<br>Status: ${escapeHtml(invoice.status)}<br>Betaaltermijn: ${escapeHtml(invoice.dueDate)}</p></div>
      <div class="box"><strong>Klant</strong><p>${escapeHtml(customer?.name)}<br>${escapeHtml(customer?.address)}, ${escapeHtml(customer?.city)}<br>${escapeHtml(customer?.email)}</p></div>
    </div>
    <table><thead><tr><th>Omschrijving</th><th>Bedrag</th></tr></thead><tbody><tr><td>${escapeHtml(quote?.number ?? "Werkzaamheden AA Klus")}</td><td>${formatEuro(quoteTotal)}</td></tr></tbody></table>
    <div class="total"><div><span>Factuurbedrag</span><strong>${formatEuro(quoteTotal)}</strong></div><div><span>Betaald</span><strong>${formatEuro(paid)}</strong></div><div class="grand"><span>Openstaand saldo</span><span>${formatEuro(open)}</span></div></div>
    <p class="muted">Graag betalen binnen de betaaltermijn onder vermelding van het factuurnummer.</p>`
  );
}
