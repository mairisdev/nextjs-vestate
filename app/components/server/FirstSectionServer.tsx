import { getTranslations } from 'next-intl/server';
import FirstSectionClient from '../FirstSection';

async function getFirstSectionData() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/first-section`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch first section data');
    }
    
    return await response.json();
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