import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';
import { upsertTranslation } from '@/lib/translations';

export async function POST() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('🔧 Sinhronizē trūkstošās PropertyPage atslēgas...');

    const locales = ['lv', 'en', 'ru'];
    const category = 'PropertyPage';
    
    // Trūkstošās atslēgas, kas jāpievieno
    const missingKeys = {
      uniqueViews: 'unikāli skatījumi',
      viewsCounter: 'skatījumi', 
      viewsLabel: 'Skatījumi',
      // Pārliecinamies, ka status tulkojumi eksistē
      statusAvailable: 'Pieejams',
      statusReserved: 'Rezervēts',
      statusSold: 'Pārdots',
      statusRented: 'Iznomāts'
    };

    let created = 0;
    let updated = 0; 
    let skipped = 0;

    for (const [key, value] of Object.entries(missingKeys)) {
      for (const locale of locales) {
        try {
          // Pārbaudām, vai tulkojums jau eksistē
          const existing = await prisma.translation.findUnique({
            where: {
              unique_translation: {
                key: `${category}.${key}`,
                locale: locale
              }
            }
          });

          if (existing) {
            if (!existing.value || existing.value === '' || existing.value === existing.key) {
              // Atjauninām tukšo vai placeholder tulkojumu
              await upsertTranslation(
                `${category}.${key}`,
                locale,
                locale === 'lv' ? value : '',
                category
              );
              updated++;
              console.log(`🔄 Updated ${category}.${key} for ${locale}`);
            } else {
              skipped++;
              console.log(`⏭️ Skipped ${category}.${key} for ${locale} (already has value: "${existing.value}")`);
            }
          } else {
            // Izveidojam jaunu tulkojumu
            await upsertTranslation(
              `${category}.${key}`,
              locale,
              locale === 'lv' ? value : '',
              category
            );
            created++;
            console.log(`✨ Created ${category}.${key} for ${locale}`);
          }
        } catch (error) {
          console.error(`❌ Error processing ${key} for ${locale}:`, error);
        }
      }
    }

    // Arī sinhronizējam PropertyDetails ar jauno uniqueViews
    console.log('🔄 Running PropertyDetails sync to ensure uniqueViews is included...');
    
    try {
      const { syncPropertyDetailsTranslations } = await import('@/lib/translationSync');
      await syncPropertyDetailsTranslations();
      console.log('✅ PropertyDetails sync completed');
    } catch (error) {
      console.error('⚠️ PropertyDetails sync failed:', error);
    }

    const totalProcessed = created + updated + skipped;
    console.log(`✅ PropertyPage trūkstošās atslēgas sinhronizētas: ${created} izveidotas, ${updated} atjauninātas, ${skipped} izlaistas (kopā: ${totalProcessed})`);

    return NextResponse.json({
      success: true,
      message: `PropertyPage trūkstošās atslēgas sinhronizētas: uniqueViews un status tulkojumi`,
      details: {
        created,
        updated,
        skipped,
        total: totalProcessed,
        keys: Object.keys(missingKeys)
      }
    });

  } catch (error) {
    console.error('❌ Error syncing missing PropertyPage keys:', error);
    return NextResponse.json({
      success: false,
      error: 'Kļūda sinhronizējot trūkstošās PropertyPage atslēgas',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}