import { getTranslations } from 'next-intl/server';
import HeroSliderClient from '../HeroSlider';

async function getSlides() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/slides`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch slides');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching slides:', error);
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