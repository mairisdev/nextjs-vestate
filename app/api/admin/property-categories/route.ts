// app/api/admin/property-categories/route.ts (AIZVIETO PILNĪBĀ)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { uploadImage } from '@/lib/s3'

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
}

export async function GET() {
  try {
    const categories = await prisma.propertyCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { properties: true }
        }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda ielādējot kategorijas" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  const formData = await req.formData()

  const name = String(formData.get("name") || "")
  const slug = String(formData.get("slug") || "")
  const description = String(formData.get("description") || "")
  const isVisible = formData.get("isVisible") === "true"
  const order = parseInt(String(formData.get("order"))) || 0

  let imageUrl = ""
  const file = formData.get("image")

  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadToCloudinary(file, 'categories')
    } catch (error) {
      console.error("Failed to upload category image:", error)
      return NextResponse.json({ error: "Neizdevās augšupielādēt attēlu" }, { status: 500 })
    }
  }

  try {
    const category = await prisma.propertyCategory.create({
      data: {
        name,
        slug,
        description,
        isVisible,
        order,
        image: imageUrl,
      },
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error("Prisma kļūda:", error)
    return NextResponse.json({ error: "Kļūda izveidojot kategoriju" }, { status: 500 })
  }
}