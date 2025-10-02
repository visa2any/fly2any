import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fly2Any Travel - Em Construção | Especialistas Brasil-EUA",
  description: "Fly2Any Travel está preparando uma experiência incrível! Especialistas em voos Brasil-EUA desde 2014. Em breve com nossa nova plataforma.",
  keywords: ["voos brasil", "passagens brasil eua", "fly2any", "viagens brasil", "voos internacionais"],
  openGraph: {
    title: "Fly2Any Travel - Em Construção",
    description: "Especialistas em voos Brasil-EUA desde 2014. Nova plataforma em desenvolvimento.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
