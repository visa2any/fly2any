import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voos Miami-São Paulo | Passagens MIA-GRU Baratas - Fly2Any",
  description: "✈️ Voos Miami-São Paulo (MIA-GRU) a partir de $650! Voos diretos LATAM e American Airlines. Cotação grátis em 2h. 8h30min de voo direto.",
  keywords: "voos miami sao paulo, passagens mia gru, voos diretos miami sao paulo, latam american airlines, voos baratos miami brasil, fly2any",
  openGraph: {
    title: "Voos Miami-São Paulo | Passagens MIA-GRU Baratas - Fly2Any", 
    description: "✈️ Voos Miami-São Paulo a partir de $650! Voos diretos em 8h30min. Cotação grátis em 2h.",
    url: "https://www.fly2any.com/voos-miami-sao-paulo",
    type: "website",
    siteName: "Fly2Any",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voos Miami-São Paulo | Passagens MIA-GRU Baratas - Fly2Any",
    description: "✈️ Voos Miami-São Paulo a partir de $650! Voos diretos em 8h30min.",
  },
  alternates: {
    canonical: "https://www.fly2any.com/voos-miami-sao-paulo",
  },
  robots: "index, follow",
};

export default function VoosMiamiSaoPauloLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}