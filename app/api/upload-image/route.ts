// app/api/upload-image/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { uploadImage } from '@/lib/s3'

async function uploadToCloudinary(file: File, folder: string, publicId: string, type: string): Promise<string> {
  // Augšupielāde uz S3 (konvertē uz webp)
  return uploadImage(file, folder, { publicId })
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('image') as File
    const title = formData.get('title') as string
    const type = formData.get('type') as string // "slider", "first-section", "second-section", etc.

    if (!file) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 })
    }

    // Validēt faila izmēru (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'Attēls pārāk liels (max 10MB)' 
      }, { status: 413 })
    }

    // Validēt faila tipu
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ 
        error: 'Faila tips nav atbalstīts. Lūdzu, izvēlieties attēla failu.' 
      }, { status: 400 })
    }

    // Izveidot drošu nosaukumu
    const safeTitle = title
      ?.normalize("NFD") // sadala diakritiskās zīmes (č -> c + ̌)
      .replace(/[\u0300-\u036f]/g, "") // izmet diakritikas
      .replace(/[^a-zA-Z0-9-_]/g, '-') // aizvieto visu citu ar -
      .replace(/-+/g, '-') // vairāki - pēc kārtas = viens -
      .toLowerCase() || 'default-title'

    // Izveidot unikālu public ID
    const timestamp = Date.now()
    const publicId = `${safeTitle}-${timestamp}`

    // Noteikt mapi atkarībā no veida
    let folder: string
    switch (type) {
      case 'first-section':
        folder = 'website/first-section'
        break
      case 'second-section':
        folder = 'website/second-section'
        break
      case 'sixth-section':
        folder = 'website/sixth-section'
        break
      case 'seven-section':
        folder = 'website/seven-section'
        break
      case 'slider':
        folder = 'website/slider'
        break
      case 'why-choose-us':
        folder = 'website/why-choose-us'
        break
      default:
        folder = 'website/general'
    }

    console.log('📤 Uploading:', {
      file: file.name,
      size: file.size,
      type: file.type,
      folder: folder,
      publicId: publicId,
      sectionType: type
    })

    const imageUrl = await uploadToCloudinary(file, folder, publicId, type)

    console.log('✅ Upload successful:', imageUrl)

    // Saglabāt datubāzē
    await saveImageUrlToDatabase(imageUrl, safeTitle, type)

    return NextResponse.json({ imageUrl }, { status: 200 })
  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json({ 
      error: 'Kļūda augšupielādējot attēlu: ' + (error instanceof Error ? error.message : 'Unknown error')
    }, { status: 500 })
  }
}

async function saveImageUrlToDatabase(imageUrl: string, sanitizedTitle: string, type: string) {
  try {
    const endpoint =
      type === 'second-section'
        ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/second-section`
        : `${process.env.NEXT_PUBLIC_SITE_URL}/api/first-section`

    const body =
      type === 'second-section'
        ? { imageUrl, title: sanitizedTitle }
        : { backgroundImage: imageUrl, title: sanitizedTitle }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error('Failed to save to database:', response.status, response.statusText)
      return
    }

    const responseText = await response.text()
    try {
      return JSON.parse(responseText)
    } catch (error) {
      console.error("Error parsing JSON response:", error)
      return responseText
    }
  } catch (error) {
    console.error('Error saving to database:', error)
  }
}