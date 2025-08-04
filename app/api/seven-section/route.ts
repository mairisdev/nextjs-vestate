// app/api/seven-section/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'
import { syncSevenSectionTranslations } from "@/lib/translationSync"

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

// Cloudinary upload funkcija ar high-quality iestatījumiem full-screen sadaļām
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      console.log(`📸 Uploading ${folder} with high-quality transformation`)
      
      cloudinary.uploader.upload_stream(
        {
          public_id: `${timestamp}-${safeFileName}`,
          folder: folder,
          resource_type: 'auto',
          transformation: [
            // High-quality full-screen background
            { width: 1920, height: 1080, crop: 'limit', quality: '90', format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('✅ High-quality upload successful:', result?.secure_url)
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
    const section = await prisma.sevenSection.findFirst()
    return NextResponse.json(section || {})
  } catch (error) {
    console.error("[SEVEN_SECTION_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const buttonText = formData.get("buttonText") as string
    const buttonLink = formData.get("buttonLink") as string
    const file = formData.get("image") as File | null

    let imageUrl = formData.get("existingImageUrl") as string || ""

    // Direct Cloudinary upload for better quality control
    if (file && file.size > 0) {
      console.log('📁 Uploading seven-section image directly to Cloudinary:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Validate file size (max 15MB for high-quality images)
      if (file.size > 15 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Attēls pārāk liels (max 15MB)" 
        }, { status: 413 })
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: "Faila tips nav atbalstīts. Lūdzu, izvēlieties attēla failu." 
        }, { status: 400 })
      }

      try {
        imageUrl = await uploadToCloudinary(file, 'seven-section')
        console.log('✅ Seven-section image uploaded successfully')
      } catch (error) {
        console.error("❌ Failed to upload seven-section image:", error)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt attēlu" 
        }, { status: 500 })
      }
    }

    const existing = await prisma.sevenSection.findFirst()

    let updated

    if (existing) {
      updated = await prisma.sevenSection.update({
        where: { id: existing.id },
        data: { title, buttonText, buttonLink, imageUrl },
      })
    } else {
      updated = await prisma.sevenSection.create({
        data: { title, buttonText, buttonLink, imageUrl },
      })
    }

    await syncSevenSectionTranslations(updated)

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[SEVEN_SECTION_POST]", error)
    const errorMessage = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}