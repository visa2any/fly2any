import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotação de Voos Online | Solicite Orçamento Grátis - Fly2Any",
  description: "💰 Solicite cotação de voos GRÁTIS em até 2 horas! Formulário simples e rápido. Especialistas em passagens Brasil-EUA há 10+ anos. Melhores preços garantidos.",
  keywords: "cotacao voos online, orcamento passagens aereas, cotacao gratuita voos, solicitar orcamento voos, passagens aereas brasil eua, fly2any",
  openGraph: {
    title: "Cotação de Voos Online | Solicite Orçamento Grátis - Fly2Any",
    description: "💰 Solicite cotação de voos GRÁTIS em até 2 horas! Melhores preços garantidos.",
    url: "https://www.fly2any.com/cotacao/voos",
    type: "website", 
    siteName: "Fly2Any",
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Cotação de Voos Online | Solicite Orçamento Grátis - Fly2Any",
    description: "💰 Solicite cotação de voos GRÁTIS em até 2 horas!",
  },
  alternates: {
    canonical: "https://www.fly2any.com/cotacao/voos",
  },
  robots: "index, follow",
};

export default function CotacaoVoosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>;
}