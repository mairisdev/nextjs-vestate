import { prisma } from '@/lib/prisma'
import { getTranslations } from "next-intl/server"
import StatsSection from "../StatsSection"

async function getStatsData() {
  try {
    const stats = await prisma.statistic.findMany({
      orderBy: { order: "asc" }
    })
    return stats
  } catch (error) {
    console.error('Error fetching statistics data:', error)
    return []
  }
}

export default async function StatsSectionServer() {
  const statsData = await getStatsData()
  const t = await getTranslations("StatsSection")

  // Sagatavo tulkojumus
  const translations: { [key: string]: string } = {
    defaultSubheading: (() => {
      try {
        return t('defaultSubheading');
      } catch {
        return "Pieredzes bagāti nekustamo īpašumu speciālisti";
      }
    })(),
    defaultHeading: (() => {
      try {
        return t('defaultHeading');
      } catch {
        return "Mūsu pārdošanas prakse";
      }
    })(),
    noStatsText: (() => {
      try {
        return t('noStatsText');
      } catch {
        return "Pašlaik nav pieejamas statistikas";
      }
    })(),
  };

  // Pievienojam katras statistikas tulkojumus
  statsData.forEach((_: any, index: number) => {
    const valueKey = `stat${index + 1}Value`;
    const descriptionKey = `stat${index + 1}Description`;
    
    try {
      translations[valueKey] = t(valueKey);
    } catch {
      // Ja nav tulkojuma, nekas nemainās
    }
    
    try {
      translations[descriptionKey] = t(descriptionKey);
    } catch {
      // Ja nav tulkojuma, nekas nemainās
    }
  });

  return (
    <StatsSection 
      stats={statsData}
      translations={translations as {
        [key: string]: string;
        defaultSubheading: string;
        defaultHeading: string;
        noStatsText: string;
      }} 
    />
  )
}
