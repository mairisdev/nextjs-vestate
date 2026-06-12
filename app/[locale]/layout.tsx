import "../globals.css"
import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';

// Ļauj Next.js iepriekš ģenerēt lapas katrai valodai (statiskā renderēšana)
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-montserrat",
})

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.vivaestate.lv';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    metadataBase: new URL(siteUrl),
    title: "Vivaestate",
    description: "Nekustamo īpašumu pārdošana",
    alternates: {
      canonical: `/${locale}`,
      languages: {
        lv: '/lv',
        en: '/en',
        ru: '/ru',
      },
    },
    openGraph: {
      type: 'website',
      siteName: 'Vivaestate',
      url: `${siteUrl}/${locale}`,
      title: 'Vivaestate',
      description: 'Nekustamo īpašumu pārdošana',
    },
  };
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Ieslēdz statisko renderēšanu next-intl serverkomponentiem šim locale
  setRequestLocale(locale);
  // Clerk netiek izmantots publiskajās lapās (tikai /admin un /sign-in, kam ir
  // savs ClerkProvider). Neietverot to šeit, publiskās lapas var ģenerēt
  // statiski (ISR) — citādi <ClerkProvider> lasa headers un padara visu dinamisku.
  return (
    <html lang={locale} className={montserrat.className}>
      <body>
        <NextIntlClientProvider>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
