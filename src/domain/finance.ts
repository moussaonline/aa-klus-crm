import type { QuoteLine } from "./models";

export function lineSubtotal(line: QuoteLine) {
  return line.quantity * line.unitPrice;
}

export function lineVat(line: QuoteLine) {
  return lineSubtotal(line) * (line.vatRate / 100);
}

export function quoteTotals(lines: QuoteLine[]) {
  const subtotal = lines.reduce((sum, line) => sum + lineSubtotal(line), 0);
  const vat = lines.reduce((sum, line) => sum + lineVat(line), 0);

  return {
    subtotal,
    vat,
    total: subtotal + vat
  };
}

export function formatEuro(value: number) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR"
  }).format(value);
}
