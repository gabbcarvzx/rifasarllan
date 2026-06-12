import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rifa Arllan | Rifas online premium",
    template: "%s | Rifa Arllan",
  },
  description:
    "Plataforma premium para criar, gerenciar e vender rifas online com uma experiência confiável e profissional.",
  applicationName: "Rifa Arllan",
  keywords: ["rifas online", "sorteios", "prêmios", "SaaS", "Supabase"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
