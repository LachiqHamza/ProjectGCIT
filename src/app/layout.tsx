import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "Project Examples — GCIT Architecture",
  description: "Step inside Villa Bellavista. Explore a contemporary Italian villa in interactive 3D, from the pool terrace to its furnished rooms.",
  openGraph: {
    title: "Villa Bellavista — Project Examples",
    description: "A closer look at contemporary living. Explore the architecture, interiors and materials in 3D.",
    images: [{ url: "/images/villa-hero.webp", width: 1920, height: 1280 }],
  },
};
export const viewport: Viewport = { themeColor: "#f6f5f1" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
