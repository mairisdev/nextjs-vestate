// app/api/admin/property-categories/route.ts (AIZVIETO PILNĪBĀ)
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
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
            { width: 400, height: 300, crop: 'fill', quality: 'auto' }
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