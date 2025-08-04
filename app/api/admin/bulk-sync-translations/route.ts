import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sourceLocale, targetLocales } = await request.json();

    if (!sourceLocale || !Array.isArray(targetLocales) || targetLocales.length === 0) {
      return NextResponse.json({ 
        error: 'Invalid parameters. sourceLocale and targetLocales are required.' 
      }, { status: 400 });
    }

    console.log(`🔄 Starting bulk sync: ${sourceLocale} → ${targetLocales.join(', ')}`);

    // 1. Iegūstam visus source locale tulkojumus
    const sourceTranslations = await prisma.translation.findMany({
      where: { locale: sourceLocale },
      orderBy: { key: 'asc' }
    });

    console.log(`📚 Found ${sourceTranslations.length} source translations in ${sourceLocale}`);

    if (sourceTranslations.length === 0) {
      return NextResponse.json({
        success: false,
        message: `Nav tulkojumu ${sourceLocale} valodā, ko kopēt.`,
        details: {
          totalKeys: 0,
          copied: 0,
          skipped: 0,
          failed: 0,
          categories: []
        }
      });
    }

    // 2. Katrai target valodai kopējam tulkojumus 
    let totalCopied = 0;
    let totalSkipped = 0;
    let totalFailed = 0;
    const processedCategories = new Set<string>();

    for (const targetLocale of targetLocales) {
      console.log(`🎯 Processing target locale: ${targetLocale}`);

      // Iegūstam esošos tulkojumus target valodā
      const existingTranslations = await prisma.translation.findMany({
        where: { locale: targetLocale },
        select: { key: true }
      });

      const existingKeys = new Set(existingTranslations.map(t => t.key));
      console.log(`📋 ${targetLocale} has ${existingKeys.size} existing translations`);

      // Filtrējam source tulkojumus - tikai tos, kas neeksistē target valodā
      const translationsToCopy = sourceTranslations.filter(t => !existingKeys.has(t.key));
      console.log(`📝 Will copy ${translationsToCopy.length} translations to ${targetLocale}`);

      // Batch insert uz target valodu
      const batchSize = 50; // Process in batches to avoid timeout
      for (let i = 0; i < translationsToCopy.length; i += batchSize) {
        const batch = translationsToCopy.slice(i, i + batchSize);
        
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

          console.log(`✅ Copied batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(translationsToCopy.length/batchSize)} to ${targetLocale}`);
        } catch (error) {
          console.error(`❌ Failed to copy batch to ${targetLocale}:`, error);
          totalFailed += batch.length;
        }
      }

      // Count skipped (existing) translations
      totalSkipped += sourceTranslations.length - translationsToCopy.length;
    }

    const response = {
      success: totalFailed === 0,
      message: totalFailed === 0 
        ? `✅ Bulk sinhronizācija pabeigta! Kopēti ${totalCopied} tulkojumi.`
        : `⚠️ Sinhronizācija pabeigta ar kļūdām. Kopēti: ${totalCopied}, Neizdevās: ${totalFailed}`,
      details: {
        totalKeys: sourceTranslations.length,
        copied: totalCopied,
        skipped: totalSkipped,
        failed: totalFailed,
        categories: Array.from(processedCategories).sort()
      }
    };

    console.log(`🎉 Bulk sync completed:`, response.details);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ Bulk sync error:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Server error during bulk synchronization',
      message: error instanceof Error ? error.message : 'Unknown error',
      details: {
        totalKeys: 0,
        copied: 0,
        skipped: 0,
        failed: 0,
        categories: []
      }
    }, { status: 500 });
  }
}