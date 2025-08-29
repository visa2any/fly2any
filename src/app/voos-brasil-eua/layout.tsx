import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voos Brasil-EUA | Passagens Aéreas Baratas - Fly2Any",
  description: "✈️ Voos Brasil-EUA com os melhores preços! Miami-São Paulo, NY-Rio, Orlando-Brasília. Cotação grátis em 2h. Especialistas em brasileiros nos EUA há 10+ anos.",
  keywords: "voos brasil eua, passagens aereas brasil estados unidos, voos baratos brasil eua, miami sao paulo, new york rio janeiro, orlando brasilia, fly2any",
  openGraph: {
    title: "Voos Brasil-EUA | Passagens Aéreas Baratas - Fly2Any",
    description: "✈️ Voos Brasil-EUA com os melhores preços! Cotação grátis em 2h. Especialistas há 10+ anos.",
    url: "https://www.fly2any.com/voos-brasil-eua",
    type: "website",
    siteName: "Fly2Any",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Voos Brasil-EUA | Passagens Aéreas Baratas - Fly2Any",
    description: "✈️ Voos Brasil-EUA com os melhores preços! Cotação grátis em 2h.",
  },
  alternates: {
    canonical: "https://www.fly2any.com/voos-brasil-eua",
  },
  robots: "index, follow",
};

export default function VoosBrasilEUALayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}