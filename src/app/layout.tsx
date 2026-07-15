import type { Metadata, Viewport } from "next";
import { brand } from "@playroom/shared";
import { Header } from "@/components/header";
import { SoundProvider } from "@/components/sound-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: brand.name, template: `%s · ${brand.name}` },
  description: brand.description,
  openGraph: { title: brand.name, description: brand.description, type: "website", locale: "fr_FR" },
  icons: { icon: "/icon.svg" }
};
export const viewport: Viewport = { themeColor: brand.colors.yellow, width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr" data-scroll-behavior="smooth"><body><SoundProvider><Header />{children}<footer className="shell footer"><span>© {new Date().getFullYear()} {brand.name}</span><span>Le vocal reste sur Discord. Ici, on joue.</span></footer></SoundProvider></body></html>;
}
