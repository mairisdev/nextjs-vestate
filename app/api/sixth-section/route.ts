import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const section = await prisma.sixthSection.findFirst()
    return NextResponse.json(section || {})
  } catch (error) {
    console.error("[SIXTH_SECTION_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const buttonText = formData.get("buttonText") as string
    const buttonLink = formData.get("buttonLink") as string
    const file = formData.get("image") as File | null

    let imageUrl = formData.get("existingImageUrl") as string || ""

    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const fileName = `section6_${Date.now()}.webp`
      const filePath = path.join(process.cwd(), "public/sixth-section", fileName)
      await writeFile(filePath, buffer)
      imageUrl = `/sixth-section/${fileName}`
    }

    const existing = await prisma.sixthSection.findFirst()

    let updated

    if (existing) {
      updated = await prisma.sixthSection.update({
        where: { id: existing.id },
        data: { title, buttonText, buttonLink, imageUrl },
      })
    } else {
      updated = await prisma.sixthSection.create({
        data: { title, buttonText, buttonLink, imageUrl },
      })
    }

    return NextResponse.json(updated)
  } catch (error) {
    console.error("[SIXTH_SECTION_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
