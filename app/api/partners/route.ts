import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'
import { randomUUID } from "crypto"
import { syncPartnersSectionTranslations } from "@/lib/translationSync"

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
            { width: 400, height: 400, crop: 'fit', quality: 'auto' }
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
    const data = await prisma.partnersSection.findUnique({
      where: { id: "partners-section" },
    })
    return NextResponse.json(data)
  } catch (error) {
    console.error("[PARTNERS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch partners data" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const subtitle = formData.get("subtitle") as string

    const partners: any[] = []
    const entries = Array.from(formData.entries())

    const grouped: Record<string, any> = {}

    for (const [key, value] of entries) {
      const match = key.match(/^partners\[(\d+)\]\[(\w+)\]$/)
      if (match) {
        const [_, index, field] = match
        if (!grouped[index]) grouped[index] = {}
        grouped[index][field] = value
      }
    }

    for (const key in grouped) {
      const p = grouped[key]

      let logoUrl = typeof p.logoUrl === "string" ? p.logoUrl : ""

      // Augšupielādējam uz Cloudinary, nevis lokālo failu sistēmu
      if (p.logo instanceof File && p.logo.name) {
        try {
          console.log('📁 Uploading partner logo to Cloudinary:', {
            name: p.logo.name,
            size: p.logo.size,
            type: p.logo.type
          })
          
          // Validējam faila izmēru (max 5MB logotipiem)
          if (p.logo.size > 5 * 1024 * 1024) {
            console.error('❌ Partner logo too large:', p.logo.size)
            throw new Error("Logo pārāk liels (max 5MB)")
          }
          
          logoUrl = await uploadToCloudinary(p.logo, 'partners')
          console.log('✅ Partner logo uploaded successfully:', logoUrl)
        } catch (uploadError) {
          console.error('❌ Failed to upload partner logo:', uploadError)
          throw new Error("Neizdevās augšupielādēt logo")
        }
      }

      partners.push({
        name: p.name as string,
        order: parseInt(p.order),
        logoUrl,
      })
    }

    const saved = await prisma.partnersSection.upsert({
      where: { id: "partners-section" },
      update: { title, subtitle, partners },
      create: {
        id: "partners-section",
        title,
        subtitle,
        partners,
      },
    })

    // Automātiska tulkojumu sinhronizācija (tikai title un subtitle)
    await syncPartnersSectionTranslations(saved)

    return NextResponse.json(saved)
  } catch (error) {
    console.error("[PARTNERS_POST]", error)
    
    // Atgriežam vairāk informatīvu kļūdas ziņojumu
    const errorMessage = error instanceof Error ? error.message : "Failed to save partners data"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}