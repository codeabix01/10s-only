import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/lib/query-provider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weights: ["400", "500"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  display: "swap",
});

const cormorantGaramond = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weights: ["700", "800"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "10s Only — Members-Only Underground Parties",
  description:
    "A members-only underground party platform. Vibe-matched, vetted, ticketed. Techno, house, DnB, experimental, hip-hop, ambient.",
  keywords: [
    "10s Only",
    "underground parties",
    "members only",
    "techno",
    "house",
    "drum and bass",
    "Mumbai",
    "Goa",
    "Bangalore",
  ],
  authors: [{ name: "10s Only" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "10s Only — Members-Only Underground Parties",
    description:
      "Vibe-matched, vetted, ticketed. The underground, member-curated.",
    siteName: "10s Only",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "10s Only",
    description: "Members-only underground parties.",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} ${cormorantGaramond.variable} antialiased bg-background text-foreground min-h-screen relative overflow-x-hidden`}
      >
        {/* Subtle background - removed neon orbs for premium aesthetic */}
        <div className="fixed inset-0 z-0 pointer-events-none" />

        {/* Content wrapper */}
        <div className="relative z-10">
          <QueryProvider>
            {children}
            <Toaster />
            <SonnerToaster position="bottom-right" richColors closeButton />
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
