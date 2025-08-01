// app/api/sixth-section/route.ts (AIZVIETO PILNĪBĀ)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
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
    const section = await prisma.sixthSection.findFirst()
    return NextResponse.json(section || {})
  } catch (error) {
    console.error("[SIXTH_SECTION_GET]", error)
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

    if (file && file.size > 0) {
      try {
        imageUrl = await uploadToCloudinary(file, 'sixth-section')
      } catch (error) {
        console.error("Failed to upload image:", error)
        return new NextResponse("Failed to upload image", { status: 500 })
      }
    }

    const existing = await prisma.sixthSection.findFirst()

    let updated

    if (existing) {
      updated = await prisma.sixthSection.update({
        where: { id: existing.id },
        data: { title, buttonText, buttonLink, imageUrl },
      })
    } else {
      updated = await prisma.sixthSection.create({
        data: { title, buttonText, buttonLink, imageUrl },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[SIXTH_SECTION_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}