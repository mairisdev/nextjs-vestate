import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { syncPartnersSectionTranslations } from "@/lib/translationSync"

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

      if (p.logo instanceof File && p.logo.name) {
        const bytes = await p.logo.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const fileName = `${randomUUID()}-${p.logo.name.replace(/\s+/g, "_")}`
        const filePath = path.join(process.cwd(), "public/partners", fileName)
        await writeFile(filePath, buffer)
        logoUrl = `/partners/${fileName}`
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
    return NextResponse.json({ error: "Failed to save partners data" }, { status: 500 })
  }
}
