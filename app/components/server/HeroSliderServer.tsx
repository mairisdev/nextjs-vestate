import { getTranslations } from 'next-intl/server';
import HeroSliderClient from '../HeroSlider';
import { headers } from 'next/headers';

async function getSlides() {
  try {
    // Iegūstam host no headers
    const headersList = await headers();
    const host = headersList.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    
    // Veidojam pilnu URL
    const baseUrl = `${protocol}://${host}`;
    
    const response = await fetch(`${baseUrl}/api/slides`, {
      cache: 'no-store',
      // Pievienojam timeout un error handling
      signal: AbortSignal.timeout(5000) // 5 sekunžu timeout
    });
    
    if (!response.ok) {
      console.error(`Failed to fetch slides: ${response.status} ${response.statusText}`);
      throw new Error(`Failed to fetch slides: ${response.status}`);
    }
    
    const slides = await response.json();
    console.log('Fetched slides:', slides); // Debug log
    return Array.isArray(slides) ? slides : [];
  } catch (error) {
    console.error('Error fetching slides:', error);
    // Atgriežam tukšu masīvu vietā null, lai komponente varētu rādīt default saturu
    return [];
  }
}

export default async function HeroSliderServer() {
    const slides = await getSlides();
    const t = await getTranslations('HeroSlider');
    
    const translations = {
      defaultSubtitle: t('defaultSubtitle'),
      defaultTitle: t('defaultTitle'), 
      defaultButtonText: t('defaultButtonText'),
      benefit1: t('benefit1'),
      benefit2: t('benefit2'),
      benefit3: t('benefit3'),
      benefit4: t('benefit4'),
      benefit5: t('benefit5'),
      benefit6: t('benefit6')
    };
  
    return (
      <HeroSliderClient 
        slides={slides}
        translations={translations}
      />
    );
  }