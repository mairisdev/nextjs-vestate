import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function GET() {
  const data = await prisma.partnersSection.findUnique({
    where: { id: "partners-section" },
  })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
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

  return NextResponse.json(saved)
}
