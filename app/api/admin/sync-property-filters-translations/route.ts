import { NextResponse } from 'next/server'
import { syncPropertyFiltersTranslations } from '@/lib/translationSync'

export async function POST() {
  try {
    await syncPropertyFiltersTranslations()
    
    return NextResponse.json({ 
      success: true, 
      message: "PropertyFilters tulkojumi sinhronizēti" 
    })
  } catch (error) {
    console.error('Error syncing PropertyFilters:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Kļūda sinhronizējot PropertyFilters tulkojumus' 
    }, { status: 500 })
  }
}