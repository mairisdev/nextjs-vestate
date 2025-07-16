import { getTranslations } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import FirstSectionClient from '../FirstSection';

async function getFirstSectionData() {
  try {
    // Tiešs database query nevis fetch
    const section = await prisma.firstSection.findFirst();
    return section;
  } catch (error) {
    console.error('Error fetching first section data:', error);
    return null;
  }
}

export default async function FirstSectionServer() {
  const sectionData = await getFirstSectionData();
  const t = await getTranslations('FirstSection');
  
  // Sagatavo tulkojumus
  const translations = {
    defaultHeadline: t('defaultHeadline'),
    defaultButtonText: t('defaultButtonText')
  };

  return (
    <FirstSectionClient 
      sectionData={sectionData}
      translations={translations} 
    />
  );
}