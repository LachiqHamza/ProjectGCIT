import type { Metadata, Viewport } from "next";
import { LanguageProvider } from "@/components/language-provider";
import { messages } from "@/lib/i18n";
import { getLocale } from "@/lib/locale-server";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = messages[locale];
  return {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: t.seoTitle,
  description: t.seoDescription,
  openGraph: {
    title: t.seoTitle,
    description: t.seoDescription,
    locale: locale === "it" ? "it_IT" : "en_GB",
    images: [{ url: "/images/villa-hero.webp", width: 1920, height: 1280 }],
  },
  };
}
export const viewport: Viewport = { themeColor: "#f6f5f1" };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const locale = await getLocale();
  return <html lang={locale}><body><LanguageProvider initialLocale={locale}>{children}</LanguageProvider></body></html>;
}
