import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { uploadImage } from '@/lib/s3'
import { v4 as uuidv4 } from "uuid"
import { syncNavigationTranslations } from "@/lib/translationSync"

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
}

export async function GET() {
  const settings = await prisma.navigationSettings.findFirst()
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type")

  if (contentType?.includes("multipart/form-data")) {
    const formData = await req.formData()

    const id = formData.get("id")?.toString()
    const logoAlt = formData.get("logoAlt")?.toString() ?? ""
    const securityText = formData.get("securityText")?.toString() ?? ""
    const phone = formData.get("phone")?.toString() ?? ""
    const menuItemsRaw = formData.get("menuItems")?.toString()
    const dropdownItemsRaw = formData.get("dropdownItems")?.toString()
    const menuItems = menuItemsRaw ? JSON.parse(menuItemsRaw) : []
    const dropdownItems = dropdownItemsRaw ? JSON.parse(dropdownItemsRaw) : []

    let logoUrl: string | null = null

    const file = formData.get("logo") as File | null
    if (file && file.size > 0) {
      console.log('📁 Uploading navigation logo to Cloudinary:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Validējam faila izmēru (max 5MB logotipam)
      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Logo pārāk liels (max 5MB)" 
        }, { status: 413 })
      }
      
      try {
        logoUrl = await uploadToCloudinary(file, 'navigation')
        console.log('✅ Navigation logo uploaded:', logoUrl)
      } catch (uploadError) {
        console.error('❌ Failed to upload navigation logo:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt logo" 
        }, { status: 500 })
      }
    }

    const updated = await prisma.navigationSettings.upsert({
      where: { id: id || "navigation-single-record" },
      update: {
        logoAlt,
        securityText,
        phone,
        menuItems,
        dropdownItems,
        ...(logoUrl ? { logoUrl } : {}),
      },
      create: {
        id: id || "navigation-single-record",
        logoAlt,
        securityText,
        phone,
        menuItems,
        dropdownItems,
        logoUrl: logoUrl || null,
      },
    })

    await syncNavigationTranslations(updated)

    return NextResponse.json(updated)
  }

  // Handle JSON requests (no file upload)
  const data = await req.json()

  const updated = await prisma.navigationSettings.upsert({
    where: { id: data.id || "navigation-single-record" },
    update: {
      logoAlt: data.logoAlt,
      securityText: data.securityText,
      phone: data.phone,
      menuItems: data.menuItems,
      dropdownItems: data.dropdownItems || [],
      ...(data.logoUrl ? { logoUrl: data.logoUrl } : {}),
    },
    create: {
      id: data.id || "navigation-single-record",
      logoAlt: data.logoAlt,
      securityText: data.securityText,
      phone: data.phone,
      menuItems: data.menuItems,
      dropdownItems: data.dropdownItems || [],
      logoUrl: data.logoUrl || null,
    },
  })

  return NextResponse.json(updated)
}