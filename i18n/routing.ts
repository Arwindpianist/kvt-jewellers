import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'ms'],
  defaultLocale: 'en',
  localePrefix: 'never', // No locale prefixes in URLs
  localeDetection: true,
  localeCookie: {
    name: 'NEXT_LOCALE',
    maxAge: 60 * 60 * 24 * 365 // 1 year
  }
});

export type Locale = 'en' | 'ms';
