// app/api/sixth-section/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImage } from '@/lib/s3'

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
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

    // Direct Cloudinary upload for better quality control
    if (file && file.size > 0) {
      console.log('📁 Uploading sixth-section image directly to Cloudinary:', {
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
        imageUrl = await uploadToCloudinary(file, 'sixth-section')
        console.log('✅ Sixth-section image uploaded successfully')
      } catch (error) {
        console.error("❌ Failed to upload sixth-section image:", error)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt attēlu" 
        }, { status: 500 })
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
    const errorMessage = error instanceof Error ? error.message : "Server error"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}