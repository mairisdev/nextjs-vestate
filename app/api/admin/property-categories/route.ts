import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import fs from "fs"

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
  const uploadDir = path.join(process.cwd(), "public", "categories")

  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  const name = String(formData.get("name") || "")
  const slug = String(formData.get("slug") || "")
  const description = String(formData.get("description") || "")
  const isVisible = formData.get("isVisible") === "true"
  const order = parseInt(String(formData.get("order"))) || 0

  let imageUrl = ""
  const file = formData.get("image")

  if (file instanceof File && file.size > 0) {
    const ext = path.extname(file.name)
    const filename = `${uuidv4()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)
    imageUrl = `/categories/${filename}`
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
