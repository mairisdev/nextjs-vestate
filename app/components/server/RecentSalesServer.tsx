import { getSoldProperties } from "@/lib/queries/soldProperties"
import { getTranslations } from "next-intl/server"
import ClientGallery from "../RecentSalesGallery"

export default async function RecentSalesServer() {
  const dbProperties = await getSoldProperties()
  const t = await getTranslations("RecentSales")

  // Sagatavo tulkojumus
  const translations: { [key: string]: string } = {
    defaultHeading: (() => {
      try {
        return t('defaultHeading');
      } catch {
        return "Karstākie piedāvājumi";
      }
    })(),
    defaultSubheading: (() => {
      try {
        return t('defaultSubheading');
      } catch {
        return "Atrodi savu sapņu īpašumu jau šodien!";
      }
    })(),
    statusSold: (() => {
      try {
        return t('statusSold');
      } catch {
        return "PĀRDOTS";
      }
    })(),
    statusActive: (() => {
      try {
        return t('statusActive');
      } catch {
        return "PĀRDOŠANĀ";
      }
    })(),
    viewMoreButton: (() => {
      try {
        return t('viewMoreButton');
      } catch {
        return "Apskatīt vairāk";
      }
    })(),
    modalCloseButton: (() => {
      try {
        return t('modalCloseButton');
      } catch {
        return "Aizvērt";
      }
    })(),
    noPropertiesText: (() => {
      try {
        return t('noPropertiesText');
      } catch {
        return "Pašlaik nav pieejamu piedāvājumu";
      }
    })(),
  };

  // Pievienojam katras īpašuma tulkojumus
  dbProperties.forEach((_, index) => {
    const keys = [
      `property${index + 1}Title`,
      `property${index + 1}Price`, 
      `property${index + 1}Size`,
      `property${index + 1}Type`,
      `property${index + 1}Floor`,
      `property${index + 1}Description`
    ];
    
    keys.forEach(key => {
      try {
        translations[key] = t(key);
      } catch {
        // Ja nav tulkojuma, nekas nemainās
      }
    });
  });

  // Transformējam datus
  const properties = dbProperties.map((p) => ({
    id: p.id,
    title: p.title,
    price: p.price,
    size: p.size,
    type: p.series,
    floor: p.floor,
    description: p.description || "",
    link: p.link,
    status: p.status === "pārdots" ? "sold" as const : "active" as const,
    images: p.imageUrls,
  }))

  return (
    <ClientGallery 
      properties={properties}
      translations={{
        defaultHeading: translations.defaultHeading,
        defaultSubheading: translations.defaultSubheading,
        statusSold: translations.statusSold,
        statusActive: translations.statusActive,
        viewMoreButton: translations.viewMoreButton,
        modalCloseButton: translations.modalCloseButton,
        noPropertiesText: translations.noPropertiesText,
        ...translations
      }} 
    />
  )
}
