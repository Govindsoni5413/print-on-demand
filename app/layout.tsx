import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { FloatingWhatsApp } from "@/components/storefront/FloatingWhatsApp";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "REVNTRIX | Premium Streetwear T-Shirts",
    template: "%s | REVNTRIX",
  },
  description: "Printed to order, delivered across India. High-definition graphic t-shirts on premium cotton.",
  keywords: ["streetwear", "graphic tees", "t-shirts india", "oversized tees", "revntrix", "print on demand"],
  authors: [{ name: "REVNTRIX" }],
  openGraph: {
    title: "REVNTRIX | Premium Streetwear T-Shirts",
    description: "Printed to order, delivered across India. Interactive 3D preview & instant WhatsApp ordering.",
    url: siteUrl,
    siteName: "REVNTRIX",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "REVNTRIX | Premium Streetwear T-Shirts",
    description: "Printed to order, delivered across India.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body className="font-sans min-h-screen flex flex-col bg-white text-[#0A0A0A] antialiased selection:bg-[#0A0A0A] selection:text-white">
        {children}
        <FloatingWhatsApp />
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
