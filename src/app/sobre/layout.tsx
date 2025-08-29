import React from 'react';
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre a Fly2Any | Nossa História e Missão",
  description: "Conheça a Fly2Any, especialista em viagens Brasil-EUA há mais de 10 anos. Nossa missão é conectar brasileiros nos Estados Unidos ao Brasil com excelência.",
  keywords: "sobre fly2any, agência viagem brasileiros, história fly2any, missão empresa",
  openGraph: {
    title: "Sobre a Fly2Any | Nossa História e Missão",
    description: "Conheça nossa história e missão de conectar brasileiros nos EUA ao Brasil.",
    url: "https://fly2any.com/sobre",
  },
};

export default function SobreLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>{children}</>
  );
}
