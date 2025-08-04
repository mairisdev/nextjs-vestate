import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'
import { syncWhyChooseUsTranslations } from "@/lib/translationSync"

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
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
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
    const data = await prisma.whyChooseUs.findFirst()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[WHY_CHOOSE_US_GET]", error)
    return NextResponse.json({ error: "Failed to fetch data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const buttonText = formData.get("buttonText") as string
    const buttonUrl = formData.get("buttonUrl") as string
    const points = JSON.parse(formData.get("points") as string)
    const existingImageUrl = formData.get("existingImageUrl") as string
    const file = formData.get("image") as File | null

    let imageUrl = existingImageUrl

    if (file && file.name) {
      try {
        imageUrl = await uploadToCloudinary(file, 'why-choose-us')
      } catch (error) {
        console.error("Failed to upload image:", error)
        return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
      }
    }

    const saved = await prisma.whyChooseUs.upsert({
      where: { id: "why-choose-us-static" },
      update: { title, buttonText, buttonUrl, points, imageUrl },
      create: {
        id: "why-choose-us-static",
        title,
        buttonText,
        buttonUrl,
        points,
        imageUrl,
      },
    })

    // Automātiska tulkojumu sinhronizācija
    await syncWhyChooseUsTranslations(saved)

    return NextResponse.json(saved)
  } catch (error) {
    console.error("[WHY_CHOOSE_US_POST]", error)
    return NextResponse.json({ error: "Failed to save data" }, { status: 500 })
  }
}