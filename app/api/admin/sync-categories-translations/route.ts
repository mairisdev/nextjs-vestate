import { NextResponse } from 'next/server'
import { syncPropertyCategoriesTranslations } from '@/lib/translationSync'
import { prisma } from '@/lib/db'

export async function POST() {
  try {
    // Iegūstam visas property kategorijas no datubāzes
    const categories = await prisma.propertyCategory.findMany({
      orderBy: { order: 'asc' }
    })

    console.log(`🔄 Sākam PropertyCategories sinhronizāciju: ${categories.length} kategorijas`)

    // Izsaucam sinhronizācijas funkciju
    await syncPropertyCategoriesTranslations(categories)
    
    console.log(`✅ PropertyCategories sinhronizācija pabeigta!`)

    return NextResponse.json({ 
      success: true, 
      message: `PropertyCategories tulkojumi sinhronizēti (${categories.length} kategorijas)` 
    })
  } catch (error) {
    console.error('❌ Error syncing PropertyCategories:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Kļūda sinhronizējot PropertyCategories tulkojumus',
      details: error instanceof Error ? error.message : 'Nezināma kļūda'
    }, { status: 500 })
  }
}
