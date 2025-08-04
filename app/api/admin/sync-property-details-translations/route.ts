import { NextResponse } from 'next/server'
import { syncPropertyDetailsTranslations } from '@/lib/translationSync'

export async function POST() {
  try {
    await syncPropertyDetailsTranslations()
    
    return NextResponse.json({ 
      success: true, 
      message: "Property details tulkojumi sinhronizēti" 
    })
  } catch (error) {
    console.error('Error syncing property details:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Kļūda sinhronizējot property details tulkojumus' 
    }, { status: 500 })
  }
}