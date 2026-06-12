import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImage } from '@/lib/s3'
import { syncWhyChooseUsTranslations } from "@/lib/translationSync"

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
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