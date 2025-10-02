import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fly2Any Travel - Under Construction | Your Travel Experts",
  description: "Fly2Any Travel is preparing an amazing experience! Your travel experts based in USA. New platform coming soon with the latest technology.",
  keywords: ["fly2any", "travel", "flights", "hotels", "travel experts", "usa travel agency"],
  openGraph: {
    title: "Fly2Any Travel - Under Construction",
    description: "Your travel experts based in USA. New platform in development.",
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
