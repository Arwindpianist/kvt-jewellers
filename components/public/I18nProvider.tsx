import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from '@/i18n/request';

export async function I18nProvider({ children }: { children: React.ReactNode }) {
  try {
    const messages = await getMessages();
    const locale = await getLocale();

    return (
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    );
  } catch (error) {
    // Fallback if i18n setup fails
    // Only log in development to reduce memory usage
    if (process.env.NODE_ENV === 'development') {
      console.error('I18nProvider error:', error);
    }
    // Return children without provider as fallback
    return <>{children}</>;
  }
}
