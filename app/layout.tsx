import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

export const metadata: Metadata = {
  title: "KVT Jewellers | Gold and Silver Trading Online - Malaysia",
  description: "Premium gold and silver jewelry, coins, and bullion. Established in 2018, KVT Jewellers offers 916 gold jewelry and 999.9 gold bar bullion.",
  keywords: ["gold jewelry", "silver", "bullion", "Malaysia", "KVT Jewellers"],
  authors: [{ name: "KVT Jewellers" }],
  openGraph: {
    title: "KVT Jewellers | Gold and Silver Trading Online",
    description: "Premium gold and silver jewelry, coins, and bullion in Malaysia",
    type: "website",
  },
  manifest: "/manifest.json",
  themeColor: "#521540",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}

