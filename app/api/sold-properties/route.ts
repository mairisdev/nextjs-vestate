import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"

export async function GET() {
  try {
    const properties = await prisma.soldProperty.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(properties)
  } catch (error) {
    console.error("[SOLD_PROPERTIES_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    const raw = formData.get("data") as string
    const parsed = JSON.parse(raw)

    const uploads: string[][] = []

    for (let i = 0; i < parsed.length; i++) {
      const files = formData.getAll(`images_${i}`) as File[]
      const urls: string[] = []

      for (const file of files) {
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer())
          const filename = `sold_${i}_${Date.now()}_${file.name}`
          const filepath = path.join(process.cwd(), "public/sold-properties", filename)
          await writeFile(filepath, buffer)
          urls.push(`/sold-properties/${filename}`)
        }
      }

      // Ja nav jaunu failu, izmanto esošās bildes
      uploads.push(urls.length > 0 ? urls : parsed[i].imageUrls)
    }

    await prisma.soldProperty.deleteMany()

    await prisma.soldProperty.createMany({
      data: parsed.map((item: any, i: number) => ({
        ...item,
        imageUrls: uploads[i],
      })),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SOLD_PROPERTIES_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
