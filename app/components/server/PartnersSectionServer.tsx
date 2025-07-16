import { prisma } from '@/lib/prisma'
import { getTranslations } from "next-intl/server"
import PartnersSection from "../PartnersSection"

export default async function PartnersSectionServer() {
  const data = await prisma.partnersSection.findFirst()
  const t = await getTranslations("PartnersSection")

  // Sagatavo tulkojumus
  const translations: { [key: string]: string } = {
    defaultTitle: (() => {
      try {
        return t('defaultTitle');
      } catch {
        return "Mūsu partneri";
      }
    })(),
    defaultSubtitle: (() => {
      try {
        return t('defaultSubtitle');
      } catch {
        return "Uzticamā sadarbība";
      }
    })(),
    noPartnersText: (() => {
      try {
        return t('noPartnersText');
      } catch {
        return "Pašlaik nav pievienoti partneri";
      }
    })(),
    noLogoText: (() => {
      try {
        return t('noLogoText');
      } catch {
        return "Nav logo";
      }
    })(),
  };

  return (
    <PartnersSection 
      data={
        data && Array.isArray(data.partners)
          ? { ...data, partners: data.partners.filter(
              (p): p is { name: string; logoUrl: string; order: number } =>
                p !== null &&
                typeof p === "object" &&
                "name" in p &&
                "logoUrl" in p &&
                "order" in p
            ) }
          : null
      }
      translations={translations as {
        [key: string]: string;
        defaultTitle: string;
        defaultSubtitle: string;
        noPartnersText: string;
        noLogoText: string;
      }} 
    />
  )
}
