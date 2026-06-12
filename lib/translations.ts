import { PrismaClient } from '@prisma/client';
import { unstable_cache, revalidateTag } from 'next/cache';
import { cache } from 'react';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Tulkojumi mainās tikai caur admin paneli, tāpēc tos kešojam (revalidate 1h)
// un dzēšam kešu, kad tie tiek atjaunoti (skat. upsertTranslation).
export const TRANSLATIONS_TAG = 'translations';

const getTranslationsCached = unstable_cache(
  async (locale: string, category?: string) => getTranslationsFromDb(locale, category),
  ['translations'],
  { revalidate: 3600, tags: [TRANSLATIONS_TAG] }
);

// React cache() dedublē izsaukumus viena pieprasījuma ietvaros (vairāki komponenti
// pieprasa vienus un tos pašus tulkojumus → viens DB pieprasījums).
export const getTranslations = cache((locale: string, category?: string) =>
  getTranslationsCached(locale, category)
);

async function getTranslationsFromDb(locale: string, category?: string) {
  try {
    const where = category 
      ? { locale, category }
      : { locale };

    const translations = await prisma.translation.findMany({
      where,
    });

    const result: Record<string, any> = {};
    
    translations.forEach(translation => {
      const keys = translation.key.split('.');
      let current = result;
      
      for (let i = 0; i < keys.length - 1; i++) {
        if (!current[keys[i]]) {
          current[keys[i]] = {};
        }
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = translation.value;
    });

    return result;
  } catch (error) {
    console.error('Error loading translations:', error);
    return {};
  }
}

export async function upsertTranslation(
  key: string, 
  locale: string, 
  value: string, 
  category?: string
) {
  try {
    const result = await prisma.translation.upsert({
      where: {
        unique_translation: { key, locale }
      },
      update: { value, category },
      create: { key, locale, value, category }
    });
    // Dzēšam tulkojumu kešu, lai izmaiņas parādās uzreiz
    revalidateTag(TRANSLATIONS_TAG);
    return result;
  } catch (error) {
    console.error('Error upserting translation:', error);
    throw error;
  }
}

export async function getAllTranslationKeys() {
  try {
    const translations = await prisma.translation.findMany({
      distinct: ['key'],
      select: { key: true, category: true }
    });
    
    return translations;
  } catch (error) {
    console.error('Error getting translation keys:', error);
    return [];
  }
}