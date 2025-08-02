import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso | Fly2Any",
  description: "Conheça os termos e condições de uso dos serviços da Fly2Any.",
  robots: "index, follow",
  openGraph: {
    title: "Termos de Uso | Fly2Any",
    description: "Conheça os termos e condições de uso dos serviços da Fly2Any.",
    url: "https://fly2any.com/termos-uso",
  },
};

export default function TermosUsoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}