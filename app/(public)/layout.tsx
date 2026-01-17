import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { Meteors } from "@/components/ui/meteors";
import { PWAInstallPrompt } from "@/components/public/PWAInstallPrompt";
import { ContentProtection } from "@/components/public/ContentProtection";
import { NextIntlClientProvider } from "next-intl";
import { CurrencyProvider } from "@/lib/currency-context";
import { cookies } from "next/headers";

// MEMORY LEAK FIX: Cache translation messages in module-level Map
// Prevents re-importing JSON files on every request, which was causing massive memory growth
const messageCache = new Map<string, any>();

async function getCachedMessages(locale: string) {
  if (messageCache.has(locale)) {
    return messageCache.get(locale);
  }
  const messages = (await import(`../../messages/${locale}.json`)).default;
  messageCache.set(locale, messages);
  return messages;
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const lang = cookieStore.get("kvt_lang")?.value ?? "en";
  const messages = await getCachedMessages(lang);

  return (
    <NextIntlClientProvider locale={lang} messages={messages}>
      <CurrencyProvider>
        <div className="relative flex min-h-screen flex-col overflow-hidden bg-transparent">
          <ContentProtection />
          <Meteors number={30} />
          <div className="relative z-10 flex min-h-screen flex-col bg-transparent">
            <Header />
            <main className="flex-1 bg-transparent">{children}</main>
            <Footer />
            <PWAInstallPrompt />
          </div>
        </div>
      </CurrencyProvider>
    </NextIntlClientProvider>
  );
}

