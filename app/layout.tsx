import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { cookies } from "next/headers";
import "./globals.css";
// Import memory optimization to disable console.log in production
import "@/lib/memory-optimization";

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
};

export function generateViewport() {
  return {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
    themeColor: "#521540",
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Get locale from cookie directly (without next-intl dependency)
  // This avoids next-intl initialization issues in root layout
  // Staff routes will always be English (no i18n provider)
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('kvt_lang')?.value;
  const locale = (localeCookie === 'ms' || localeCookie === 'en') ? localeCookie : 'en';
  
  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/app.jpg" type="image/jpeg" />
        <link rel="apple-touch-icon" href="/app.jpg" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KVT Jewellers" />
      </head>
      <body className="font-sans antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange={false}
        >
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </ThemeProvider>
      </body>
    </html>
  );
}

