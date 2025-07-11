// i18n/request.ts
import {getRequestConfig} from 'next-intl/server';
import {hasLocale} from 'next-intl';
import {routing} from './routing';
import { getTranslations } from '@/lib/translations';
 
export default getRequestConfig(async ({requestLocale}) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;
 
  // Iegūst tulkojumus no datubāzes
  const messages = await getTranslations(locale);
 
  return {
    locale,
    messages
  };
});
