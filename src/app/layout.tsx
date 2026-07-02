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

function getMetadataBase() {
  const value = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!value) {
    return undefined;
  }

  try {
    return new URL(value);
  } catch {
    return undefined;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getPublicPlatformSettings();
  const title = settings.seo_title ?? settings.platform_name;
  const description = settings.seo_description ?? settings.platform_subtitle ?? undefined;

  return {
    metadataBase: getMetadataBase(),
    title: {
      default: title,
      template: `%s | ${settings.platform_name}`,
    },
    description,
    applicationName: settings.platform_name,
    category: "ecommerce",
    icons: settings.favicon_url
      ? { icon: [{ url: settings.favicon_url }] }
      : undefined,
    keywords: ["rifas online", "premios", "reservas", settings.platform_name],
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      type: "website",
      siteName: settings.platform_name,
      title,
      description,
      images: settings.hero_banner_url ? [{ url: settings.hero_banner_url }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.hero_banner_url ? [settings.hero_banner_url] : undefined,
    },
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
        <a href="#conteudo-principal" className="skip-link">
          Pular para o conteudo principal
        </a>
        {children}
      </body>
    </html>
  );
}
