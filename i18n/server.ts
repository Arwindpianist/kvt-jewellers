import { getTranslations } from 'next-intl/server';
import { getLocale } from './request';

export async function getServerTranslations(namespace?: string) {
  const locale = await getLocale();
  return getTranslations({ locale, namespace });
}
