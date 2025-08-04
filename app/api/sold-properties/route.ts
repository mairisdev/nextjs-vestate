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

// Cloudinary upload funkcija
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      cloudinary.uploader.upload_stream(
        {
          public_id: `${timestamp}-${safeFileName}`,
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 800, height: 600, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            resolve(result!.secure_url)
          }
        }
      ).end(buffer)
    } catch (error) {
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

    const uploads: string[][] = []

    for (let i = 0; i < parsed.length; i++) {
      const files = formData.getAll(`images_${i}`) as File[]
      const urls: string[] = []

      for (const file of files) {
        if (file.size > 0) {
          console.log(`📁 Uploading sold property ${i + 1} image to Cloudinary:`, {
            name: file.name,
            size: file.size
          })
          
          // Validējam faila izmēru (max 10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.error(`❌ Sold property ${i + 1} image too large:`, file.size)
            continue // Izlaižam pārāk lielus failus
          }
          
          try {
            const imageUrl = await uploadToCloudinary(file, 'sold-properties')
            urls.push(imageUrl)
            console.log(`✅ Sold property ${i + 1} image uploaded:`, imageUrl)
          } catch (uploadError) {
            console.error(`❌ Failed to upload sold property ${i + 1} image:`, uploadError)
            // Turpinām ar citiem attēliem
          }
        }
      }

      // Ja nav jaunu failu, izmanto esošās bildes
      uploads.push(urls.length > 0 ? urls : parsed[i].imageUrls || [])
    }

    await prisma.soldProperty.deleteMany()

    const createdProperties = await prisma.soldProperty.createMany({
      data: parsed.map((item: any, i: number) => ({
        ...item,
        imageUrls: uploads[i],
      })),
    })

    // Automātiska tulkojumu sinhronizācija
    await syncRecentSalesTranslations(parsed)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SOLD_PROPERTIES_POST]", error)
    const errorMessage = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}