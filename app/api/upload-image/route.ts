import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Cloudinary konfigurācija
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Improved transformations based on usage context
function getTransformationForType(type: string) {
  switch (type) {
    case 'second-section':
      // Second section - preserve aspect ratio, don't crop content
      return [
        { width: 800, height: 600, crop: 'limit', quality: 'auto', format: 'auto' }
      ]
    case 'first-section':
      // First section background - can be cropped to fit
      return [
        { width: 1920, height: 1080, crop: 'fill', quality: 'auto', format: 'auto' }
      ]
    case 'sixth-section':
    case 'seven-section':
      // Other sections - preserve content, don't crop aggressively
      return [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto', format: 'auto' }
      ]
    case 'slider':
      // Slider images - can be cropped to fit aspect ratio
      return [
        { width: 1920, height: 1080, crop: 'fill', quality: 'auto', format: 'auto' }
      ]
    default:
      // Default - preserve aspect ratio
      return [
        { width: 1200, height: 800, crop: 'limit', quality: 'auto', format: 'auto' }
      ]
  }
}

// Cloudinary upload funkcija ar uzlabotām transformācijām
async function uploadToCloudinary(file: File, folder: string, publicId: string, type: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      
      // Get appropriate transformation based on type
      const transformation = getTransformationForType(type)
      
      console.log(`📸 Uploading ${type} with transformation:`, transformation)
      
      cloudinary.uploader.upload_stream(
        {
          public_id: publicId,
          folder: folder,
          resource_type: 'auto',
          transformation: transformation
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Cloudinary upload success:', result?.secure_url)
            resolve(result!.secure_url)
          }
        }
      ).end(buffer)
    } catch (error) {
      console.error('Buffer processing error:', error)
      reject(error)
    }
  })
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

    // Noteikt Cloudinary mapi atkarībā no veida
    let cloudinaryFolder: string
    switch (type) {
      case 'first-section':
        cloudinaryFolder = 'website/first-section'
        break
      case 'second-section':
        cloudinaryFolder = 'website/second-section'
        break
      case 'sixth-section':
        cloudinaryFolder = 'website/sixth-section'  
        break
      case 'seven-section':
        cloudinaryFolder = 'website/seven-section'
        break
      case 'slider':
        cloudinaryFolder = 'website/slider'
        break
      default:
        cloudinaryFolder = 'website/general'
    }

    console.log('📤 Uploading to Cloudinary:', {
      file: file.name,
      size: file.size,
      type: file.type,
      folder: cloudinaryFolder,
      publicId: publicId,
      sectionType: type
    })

    // Upload uz Cloudinary ar pareizajām transformācijām
    const imageUrl = await uploadToCloudinary(file, cloudinaryFolder, publicId, type)

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