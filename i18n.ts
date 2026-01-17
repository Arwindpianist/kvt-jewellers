import { getRequestConfig } from 'next-intl/server';

// MEMORY LEAK FIX: Cache translation messages to prevent re-importing on every request
// This is critical as getRequestConfig is called frequently by next-intl
const messageCache = new Map<string, any>();

async function getCachedMessages(locale: string) {
  if (messageCache.has(locale)) {
    return messageCache.get(locale);
  }
  const messages = (await import(`./messages/${locale}.json`)).default;
  messageCache.set(locale, messages);
  return messages;
}

export default getRequestConfig(async () => {
  return {
    locale: 'en',
    messages: await getCachedMessages('en')
  };
});
