// lib/safeTranslations.ts
import { getTranslations } from 'next-intl/server';

/**
 * Droša tulkojumu funkcija, kas atgriež fallback vērtību, ja tulkojums neeksistē
 */
export async function getSafeTranslations(namespace: string) {
  try {
    const t = await getTranslations(namespace);
    
    return {
      // Funkcija drošai tulkojumu iegūšanai
      safe: (key: string, fallback: string = '') => {
        try {
          return t(key);
        } catch (error) {
          console.warn(`Translation missing: ${namespace}.${key}, using fallback: "${fallback}"`);
          return fallback;
        }
      },
      
      // Oriģinālā funkcija, ja vajag
      t
    };
  } catch (error) {
    console.error(`Failed to load translations for namespace: ${namespace}`, error);
    
    // Atgriež mock funkciju, ja viss cits nedarbojas
    return {
      safe: (key: string, fallback: string = '') => {
        console.warn(`Translation namespace missing: ${namespace}.${key}, using fallback: "${fallback}"`);
        return fallback;
      },
      t: (key: string) => key // Fallback - atgriež key nosaukumu
    };
  }
}

/**
 * Utility funkcija dinamiskām tulkojumu atslēgām (piem. agent1, agent2, utt.)
 */
export async function getSafeDynamicTranslations(
  namespace: string, 
  keyPrefix: string, 
  count: number, 
  fallbackGenerator?: (index: number) => string
) {
  const { safe } = await getSafeTranslations(namespace);
  const results: string[] = [];
  
  for (let i = 1; i <= count; i++) {
    const key = `${keyPrefix}${i}`;
    const fallback = fallbackGenerator ? fallbackGenerator(i) : `${keyPrefix} ${i}`;
    results.push(safe(key, fallback));
  }
  
  return results;
}