import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'
import { syncRecentSalesTranslations } from "@/lib/translationSync"

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

// Uzlabota Cloudinary upload funkcija
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 8)
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      cloudinary.uploader.upload_stream(
        {
          public_id: `${timestamp}-${randomId}-${safeFileName}`,
          folder: folder,
          resource_type: 'auto',
          // Uzlabota transformācija galerijas attēliem
          transformation: [
            { 
              width: 1200, 
              height: 800, 
              crop: 'limit',     // Nesapgrieķ, tikai samazina ja vajag
              quality: 'auto',     // Augsta kvalitāte
              format: 'auto',    // Automātiski izvēlas labāko formātu
              fetch_format: 'auto'
            }
          ],
          // Papildu opcijas labākai kvalitātei
          flags: 'progressive',
          secure: true
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('✅ Image uploaded successfully:', result?.secure_url)
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

export async function GET() {
  try {
    const properties = await prisma.soldProperty.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(properties)
  } catch (error) {
    console.error("[SOLD_PROPERTIES_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const raw = formData.get("data") as string
    const parsed = JSON.parse(raw)

    console.log(`📊 Processing ${parsed.length} properties...`)
    const uploads: string[][] = []

    // Apstrādājam katru īpašumu
    for (let i = 0; i < parsed.length; i++) {
      const files = formData.getAll(`images_${i}`) as File[]
      const urls: string[] = []
      
      console.log(`📁 Property ${i + 1}: Found ${files.length} files`)

      // Apstrādājam katru attēlu
      for (let j = 0; j < files.length; j++) {
        const file = files[j]
        
        if (file.size > 0) {
          console.log(`📸 Uploading property ${i + 1}, image ${j + 1}:`, {
            name: file.name,
            size: Math.round(file.size / 1024) + 'KB',
            type: file.type
          })
          
          // Validējam faila izmēru (max 15MB - palielināts limits)
          if (file.size > 15 * 1024 * 1024) {
            console.error(`❌ Property ${i + 1}, image ${j + 1} too large:`, Math.round(file.size / 1024 / 1024) + 'MB')
            continue
          }
          
          // Validējam faila tipu
          if (!file.type.startsWith('image/')) {
            console.error(`❌ Property ${i + 1}, image ${j + 1} invalid type:`, file.type)
            continue
          }
          
          try {
            const imageUrl = await uploadToCloudinary(file, 'sold-properties')
            urls.push(imageUrl)
            console.log(`✅ Property ${i + 1}, image ${j + 1} uploaded successfully`)
          } catch (uploadError) {
            console.error(`❌ Failed to upload property ${i + 1}, image ${j + 1}:`, uploadError)
            // Turpinām ar citiem attēliem, neapstājamies pie kļūdas
          }
        }
      }

      // Ja nav jaunu failu, izmanto esošās bildes
      const finalUrls = urls.length > 0 ? urls : (parsed[i].imageUrls || [])
      uploads.push(finalUrls)
      
      console.log(`✅ Property ${i + 1} processed: ${finalUrls.length} images total`)
    }

    // Dzēšam vecos ierakstus
    await prisma.soldProperty.deleteMany()
    console.log('🗑️ Old properties deleted')

    // Izveidojam jaunos ierakstus
    const createdProperties = await prisma.soldProperty.createMany({
      data: parsed.map((item: any, i: number) => ({
        ...item,
        imageUrls: uploads[i],
      })),
    })

    console.log(`✅ Created ${createdProperties.count} new properties`)

    // Automātiska tulkojumu sinhronizācija
    try {
      await syncRecentSalesTranslations(parsed)
      console.log('✅ Translations synced')
    } catch (syncError) {
      console.error('⚠️ Translation sync failed:', syncError)
      // Neapstājamies pie tulkošanas kļūdas
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully processed ${parsed.length} properties with ${uploads.flat().length} total images`
    })
  } catch (error) {
    console.error("[SOLD_PROPERTIES_POST]", error)
    const errorMessage = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}