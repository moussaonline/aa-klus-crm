import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AA Klus CRM",
  description: "CRM MVP voor renovatie- en klusbedrijf AA Klus"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
