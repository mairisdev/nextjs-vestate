import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  const settings = await prisma.navigationSettings.findFirst()
  return NextResponse.json(settings)
}

export async function POST(req: Request) {
  const contentType = req.headers.get("content-type")

  // Ja form-data, tad jāapstrādā failu augšupielāde
  if (contentType?.includes("multipart/form-data")) {
    const formData = await req.formData()

    const id = formData.get("id")?.toString()
    const logoAlt = formData.get("logoAlt")?.toString() ?? ""
    const securityText = formData.get("securityText")?.toString() ?? ""
    const phone = formData.get("phone")?.toString() ?? ""
    const menuItemsRaw = formData.get("menuItems")?.toString()
    const menuItems = menuItemsRaw ? JSON.parse(menuItemsRaw) : []

    let logoUrl: string | null = null

    const file = formData.get("logo") as File | null
    if (file && file.size > 0) {
      const ext = path.extname(file.name) || ".webp"
      const fileName = `logo_${uuidv4()}${ext}`
      const filePath = path.join(process.cwd(), "public/uploads/navigation", fileName)
      const buffer = Buffer.from(await file.arrayBuffer())
      await writeFile(filePath, buffer)
      logoUrl = fileName
    }

    const updated = await prisma.navigationSettings.upsert({
      where: { id: id || "navigation-single-record" },
      update: {
        logoAlt,
        securityText,
        phone,
        menuItems,
        ...(logoUrl ? { logoUrl } : {}), // Tikai ja jauns logo ir augšupielādēts
      },
      create: {
        id: id || "navigation-single-record",
        logoAlt,
        securityText,
        phone,
        menuItems,
        logoUrl: logoUrl || null,
      },
    })

    return NextResponse.json(updated)
  }

  // Pretējā gadījumā sagaida JSON
  const data = await req.json()

  const updated = await prisma.navigationSettings.upsert({
    where: { id: data.id || "navigation-single-record" },
    update: {
      logoAlt: data.logoAlt,
      securityText: data.securityText,
      phone: data.phone,
      menuItems: data.menuItems,
      ...(data.logoUrl ? { logoUrl: data.logoUrl } : {}),
    },
    create: {
      id: data.id || "navigation-single-record",
      logoAlt: data.logoAlt,
      securityText: data.securityText,
      phone: data.phone,
      menuItems: data.menuItems,
      logoUrl: data.logoUrl || null,
    },
  })

  return NextResponse.json(updated)
}
