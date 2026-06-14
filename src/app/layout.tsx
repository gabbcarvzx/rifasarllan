import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getPublicPlatformSettings } from "@/lib/platform-settings/public";
import { getPlatformThemeStyle } from "@/lib/platform-settings/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicPlatformSettings();

  return {
    title: {
      default: settings.seo_title ?? settings.platform_name,
      template: `%s | ${settings.platform_name}`,
    },
    description: settings.seo_description ?? settings.platform_subtitle,
    applicationName: settings.platform_name,
    icons: settings.favicon_url
      ? { icon: [{ url: settings.favicon_url }] }
      : undefined,
    keywords: ["rifas online", "premios", "reservas", settings.platform_name],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getPublicPlatformSettings();

  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={getPlatformThemeStyle(settings)}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
