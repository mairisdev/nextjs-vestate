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
 
  // Ielādē visus tulkojumus konkrētajai valodai
  const messages = await getTranslations(locale);
 
  return {
    locale,
    messages,
    // Pievienojam onError handler, kas nemet kļūdas
    onError: (error) => {
      // Logojam kļūdu, bet nemetam exception
      console.warn(`Translation error for locale ${locale}:`, error.message);
    },
    // Pievienojam getMessageFallback, kas atgriež fallback vērtību
    getMessageFallback: ({ namespace, key, error }) => {
      const path = [namespace, key].filter((part) => part != null).join('.');
      console.warn(`Translation missing: ${path} for locale ${locale}`);
      
      // Atgriežam key nosaukumu kā fallback
      return key || path;
    }
  };
});