// app/components/server/RecentSalesServer.tsx
import { getSoldProperties } from "@/lib/queries/soldProperties"
import { getSafeTranslations } from "@/lib/safeTranslations"
import ClientGallery from "../RecentSalesGallery"

export default async function RecentSalesServer() {
  const dbProperties = await getSoldProperties()
  const { safe } = await getSafeTranslations('RecentSalesGallery');

  console.log('🏠 RecentSales: Found', dbProperties.length, 'properties');

  // Sakārtojam tulkojumus ar pareizajiem tipiem
  const translations = {
    defaultHeading: safe('defaultHeading', 'Mūsu darbi'),
    defaultSubheading: safe('defaultSubheading', 'Apskatieties mūsu veiksmīgi pārdotos īpašumus'),
    statusSold: safe('statusSold', 'Pārdots'),
    statusActive: safe('statusActive', 'Pārdošanā'),
    viewMoreButton: safe('viewMoreButton', 'Skatīt vairāk'),
    modalCloseButton: safe('modalCloseButton', 'Aizvērt'),
    noPropertiesText: safe('noPropertiesText', 'Pagaidām nav pārdoto īpašumu'),
    // Papildus tulkojumi katram īpašumam
    property1Title: safe('property1Title', ''),
    property2Title: safe('property2Title', ''),
    property3Title: safe('property3Title', ''),
    property4Title: safe('property4Title', ''),
    property5Title: safe('property5Title', ''),
    property6Title: safe('property6Title', '')
  };

  // Drošas pārbaudes īpašumiem
  const safeProperties = Array.isArray(dbProperties) ? dbProperties : []

  const properties = safeProperties.map((p, index) => {
    console.log(`🏠 Property ${index + 1}:`, {
      id: p.id,
      title: p.title,
      price: p.price,
      images: p.imageUrls?.length || 0
    });
    
    return {
      id: p.id || '',
      title: p.title || 'Īpašums',
      price: p.price || 'Cena pēc pieprasījuma',
      size: p.size || 'Nav norādīts',
      type: p.series || 'Nav norādīts',
      floor: p.floor || 'Nav norādīts',
      description: p.description || '',
      link: p.link || '#',
      status: (p.status === "pārdots" ? "sold" : "active") as "sold" | "active",
      images: Array.isArray(p.imageUrls) ? p.imageUrls.filter(url => url && url.trim() !== '') : []
    }
  })

  console.log('🌐 RecentSales translations:', translations);

  return <ClientGallery properties={properties} translations={translations} />
}