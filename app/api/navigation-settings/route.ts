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

    return NextResponse.json(updated)
  }

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
