import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

export async function POST(req: Request) {
  const formData = await req.formData()

  const title = formData.get("title") as string
  const buttonText = formData.get("buttonText") as string
  const points = JSON.parse(formData.get("points") as string) as string[]

  const file = formData.get("image") as File

  if (!file || !file.name) return NextResponse.json({ error: "Missing image" }, { status: 400 })

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  const fileName = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`
  const filePath = path.join(process.cwd(), "public/why-choose-us", fileName)

  await writeFile(filePath, buffer)

  const imageUrl = `/why-choose-us/${fileName}`

  const saved = await prisma.whyChooseUs.upsert({
    where: { id: "why-choose-us-static" }, // vai vienkārši ņemam pirmo ierakstu
    update: { title, buttonText, points, imageUrl },
    create: {
      id: "why-choose-us-static",
      title,
      buttonText,
      points,
      imageUrl,
    },
  })

  return NextResponse.json(saved)
}
