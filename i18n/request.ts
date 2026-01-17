import { cookies } from 'next/headers';
import { routing } from './routing';
import type { Locale } from './routing';

// MEMORY LEAK FIX: Cache translation messages to prevent re-importing on every request
const messageCache = new Map<string, any>();

export async function getLocale(): Promise<Locale> {
  const cookieName: string = (typeof routing.localeCookie === 'object' && routing.localeCookie && 'name' in routing.localeCookie)
    ? (routing.localeCookie.name || 'NEXT_LOCALE')
    : 'NEXT_LOCALE';
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(cookieName)?.value;
  const locale = (cookieLocale && routing.locales.includes(cookieLocale as any))
    ? (cookieLocale as Locale)
    : routing.defaultLocale;
  return locale;
}

export async function getMessages() {
  const locale = await getLocale();
  
  // MEMORY LEAK FIX: Return cached messages if available, otherwise load and cache
  if (messageCache.has(locale)) {
    return messageCache.get(locale);
  }
  
  const messages = (await import(`../messages/${locale}.json`)).default;
  messageCache.set(locale, messages);
  return messages;
}
