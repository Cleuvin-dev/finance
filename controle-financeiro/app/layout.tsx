import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finanças — Controle financeiro",
  description: "Lançamentos, pagamentos, receitas e metas em um único controle financeiro.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/finance-favicon.svg",
    shortcut: "/finance-favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="antialiased">{children}</body>
    </html>
  );
}
