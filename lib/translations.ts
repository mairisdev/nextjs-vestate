import { PrismaClient } from '@prisma/client';

// Izveido prisma instance
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export async function getTranslations(locale: string, category?: string) {
  try {
    const where = category 
      ? { locale, category }
      : { locale };

    const translations = await prisma.translation.findMany({
      where,
    });

    // Pārveido uz objektu formātu
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
    return await prisma.translation.upsert({
      where: {
        key_locale: { key, locale }
      },
      update: { value, category },
      create: { key, locale, value, category }
    });
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