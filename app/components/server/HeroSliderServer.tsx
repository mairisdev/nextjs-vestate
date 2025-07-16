import { prisma } from '@/lib/prisma'
import { getSafeTranslations } from '@/lib/safeTranslations';
import HeroSliderClient from '../HeroSlider';

async function getSlides() {
  try {
    const slides = await prisma.slide.findMany({
      orderBy: { order: 'asc' }
    })
    console.log('Slides data fetched successfully:', slides.length, 'slides')
    return slides
  } catch (error) {
    console.error('Error fetching slides:', error)
    return []
  }
}

export default async function HeroSliderServer() {
  const slides = await getSlides();
  const { safe } = await getSafeTranslations('HeroSlider');
  
  // Sakārtojam pareizo tulkojumu objektu - katrs benefit kā atsevišķa vērtība
  const translations = {
    defaultTitle: safe('defaultTitle', 'Jūsu sapņu māja'),
    defaultSubtitle: safe('defaultSubtitle', 'Atrodiet ideālo īpašumu'),
    defaultDescription: safe('defaultDescription', 'Mēs palīdzēsim atrast jūsu sapņu māju'),
    defaultButtonText: safe('defaultButtonText', 'Apskatīt piedāvājumus'),
    // Katrs benefit kā atsevišķa vērtība, nevis masīvs
    benefit1: safe('benefit1', 'Profesionāla pieredze'),
    benefit2: safe('benefit2', 'Individuāla pieeja'),
    benefit3: safe('benefit3', 'Tirgus analīze'),
    benefit4: safe('benefit4', 'Juridiskā palīdzība'),
    benefit5: safe('benefit5', 'Komunikācija un atbalsts'),
    benefit6: safe('benefit6', 'Mārketinga stratēģijas')
  };

  console.log('HeroSlider slides count:', slides.length);
  
  return (
    <HeroSliderClient 
      slides={slides}
      translations={translations}
    />
  );
}