import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import fs from "fs"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const uploadDir = path.join(process.cwd(), "public", "agents")

  // Pārliecinies, ka mape eksistē
  if (!fs.existsSync(uploadDir)) {
    await mkdir(uploadDir, { recursive: true })
  }

  let agents: any[] = []

  try {
    const parsed = JSON.parse(formData.get("agents") as string)
    if (Array.isArray(parsed)) {
      agents = parsed
    } else {
      return NextResponse.json({ success: false, message: "Agents must be an array" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ success: false, message: "Invalid JSON for agents" }, { status: 400 })
  }

  const files = formData.getAll("files") as File[]
  const createdAgents = []

  for (const agent of agents) {
    let imageUrl = agent.image
    const matchedFile = files.find((f) => f.name === agent.image)

    if (matchedFile) {
      const ext = path.extname(matchedFile.name)
      const filename = `${uuidv4()}${ext}`
      const buffer = Buffer.from(await matchedFile.arrayBuffer())
      const filePath = path.join(uploadDir, filename)

      await writeFile(filePath, buffer)
      imageUrl = `/agents/${filename}`
    }

    try {
      const upserted = await prisma.agent.upsert({
        where: {
          name_phone: {
            name: agent.name,
            phone: agent.phone,
          },
        },
        update: {
          title: agent.title,
          image: imageUrl,
          reviews: agent.reviews || [],
        },
        create: {
          name: agent.name,
          title: agent.title,
          phone: agent.phone,
          image: imageUrl,
          reviews: agent.reviews || [],
        },
      })

      createdAgents.push(upserted)
    } catch (err) {
      return NextResponse.json({ success: false, message: "Database error", error: String(err) }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, agents: createdAgents })
}
