import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceLocale, targetLocales, overwriteEmpty = true } = await request.json();

    if (!sourceLocale || !Array.isArray(targetLocales) || targetLocales.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid parameters. sourceLocale and targetLocales are required.' 
      }, { status: 400 });
    }

    console.log(`🔄 Starting enhanced bulk sync: ${sourceLocale} → ${targetLocales.join(', ')}`);
    console.log(`📝 Overwrite empty values: ${overwriteEmpty}`);

    // 1. Iegūstam visus source locale tulkojumus ar nepukšām vērtībām
    const sourceTranslations = await prisma.translation.findMany({
      where: { 
        locale: sourceLocale,
        value: {
          not: ""  // Tikai tulkojumi, kuriem ir vērtība
        }
      },
      orderBy: { key: 'asc' }
    });

    console.log(`📚 Found ${sourceTranslations.length} non-empty source translations in ${sourceLocale}`);

    if (sourceTranslations.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Nav tulkojumu ar vērtībām ${sourceLocale} valodā, ko kopēt.`,
        details: {
          totalKeys: 0,
          copied: 0,
          updated: 0,
          skipped: 0,
          failed: 0,
          categories: []
        }
      });
    }

    // 2. Katrai target valodai kopējam tulkojumus 
    let totalCopied = 0;    // Jauni ieraksti
    let totalUpdated = 0;   // Atjauninājumi esošajiem
    let totalSkipped = 0;   // Izlaistie (ja ir nepukša vērtība)
    let totalFailed = 0;    // Neizdevušies
    const processedCategories = new Set<string>();

    for (const targetLocale of targetLocales) {
      console.log(`🎯 Processing target locale: ${targetLocale}`);

      // Iegūstam visus esošos tulkojumus target valodā
      const existingTranslations = await prisma.translation.findMany({
        where: { locale: targetLocale },
        select: { key: true, value: true, id: true }
      });

      // Izveidojam mapi esošajiem tulkojumiem
      const existingMap = new Map(
        existingTranslations.map(t => [t.key, { value: t.value.trim(), id: t.id }])
      );

      console.log(`📋 ${targetLocale} has ${existingMap.size} existing translations`);

      // Kategorizējam source tulkojumus
      const toCreate: typeof sourceTranslations = [];
      const toUpdate: Array<{translation: typeof sourceTranslations[0], targetId: string}> = [];
      const toSkip: typeof sourceTranslations = [];

      for (const sourceTranslation of sourceTranslations) {
        const existing = existingMap.get(sourceTranslation.key);
        
        if (!existing) {
          // Nav esošā tulkojuma - izveidosim jaunu
          toCreate.push(sourceTranslation);
        } else if (existing.value === "" || existing.value === sourceTranslation.key) {
          // Esošais ir tukšs vai placeholder - atjauninosim (ja overwriteEmpty = true)
          if (overwriteEmpty) {
            toUpdate.push({ translation: sourceTranslation, targetId: existing.id });
          } else {
            toSkip.push(sourceTranslation);
          }
        } else {
          // Esošajam ir vērtība - izlaižam
          toSkip.push(sourceTranslation);
        }
      }

      console.log(`📊 ${targetLocale} plan: Create ${toCreate.length}, Update ${toUpdate.length}, Skip ${toSkip.length}`);

      // Batch create jaunie tulkojumi
      if (toCreate.length > 0) {
        const batchSize = 50;
        for (let i = 0; i < toCreate.length; i += batchSize) {
          const batch = toCreate.slice(i, i + batchSize);
          
          try {
            await prisma.translation.createMany({
              data: batch.map(translation => ({
                key: translation.key,
                locale: targetLocale,
                value: translation.value,
                category: translation.category
              })),
              skipDuplicates: true
            });

            totalCopied += batch.length;
            
            // Add categories to processed set
            batch.forEach(t => {
              if (t.category) processedCategories.add(t.category);
            });

            console.log(`✅ Created batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(toCreate.length/batchSize)} for ${targetLocale}`);
          } catch (error) {
            console.error(`❌ Failed to create batch for ${targetLocale}:`, error);
            totalFailed += batch.length;
          }
        }
      }

      // Batch update esošie tulkojumi
      if (toUpdate.length > 0) {
        for (const { translation, targetId } of toUpdate) {
          try {
            await prisma.translation.update({
              where: { id: targetId },
              data: { 
                value: translation.value,
                category: translation.category // Update category ja vajag
              }
            });

            totalUpdated++;
            
            if (translation.category) {
              processedCategories.add(translation.category);
            }

          } catch (error) {
            console.error(`❌ Failed to update translation ${translation.key} for ${targetLocale}:`, error);
            totalFailed++;
          }
        }
        
        console.log(`🔄 Updated ${toUpdate.length} translations for ${targetLocale}`);
      }

      // Count skipped
      totalSkipped += toSkip.length;
    }

    const totalProcessed = totalCopied + totalUpdated;
    const response = {
      success: totalFailed === 0,
      message: totalFailed === 0 
        ? `✅ Bulk sinhronizācija pabeigta! Kopēti: ${totalCopied}, Atjaunināti: ${totalUpdated}, Kopā: ${totalProcessed}`
        : `⚠️ Sinhronizācija pabeigta ar kļūdām. Kopēti: ${totalCopied}, Atjaunināti: ${totalUpdated}, Neizdevās: ${totalFailed}`,
      details: {
        totalKeys: sourceTranslations.length,
        copied: totalCopied,
        updated: totalUpdated,
        skipped: totalSkipped,
        failed: totalFailed,
        categories: Array.from(processedCategories).sort()
      }
    };

    console.log(`🎉 Enhanced bulk sync completed:`, response.details);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Enhanced bulk sync error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error during bulk synchronization',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        totalKeys: 0,
        copied: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        categories: []
      }
    }, { status: 500 });
  }
}