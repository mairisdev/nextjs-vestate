import { writeFile } from "fs/promises"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const uploadDir = path.join(process.cwd(), "public", "agents")

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

    const created = await prisma.agent.create({
      data: {
        name: agent.name,
        title: agent.title,
        phone: agent.phone,
        image: imageUrl,
        reviews: agent.reviews || [],
      }
    })

    createdAgents.push(created)
  }

  return NextResponse.json({ success: true, agents: createdAgents })
}
