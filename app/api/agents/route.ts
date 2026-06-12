import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImage } from '@/lib/s3'
import { syncAgentTranslations } from "@/lib/translationSync"

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  // Augšupielāde uz S3 (konvertē uz webp)
  return uploadImage(file, folder)
}

export async function GET() {
  try {
    const agents = await prisma.agent.findMany({
      include: {
        reviews: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({ success: true, agents })
  } catch (error) {
    return NextResponse.json({ success: false, message: "Database error", error: String(error) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()

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

    // Saglabā aģenta attēlu, ja tika augšupielādēts
    if (matchedFile) {
      try {
        imageUrl = await uploadToCloudinary(matchedFile, 'agents')
      } catch (error) {
        console.error("Failed to upload agent image:", error)
        imageUrl = null // Fallback
      }
    }

    // Izveido aģentu datubāzē (tikai CREATE)
    try {
      const createdAgent = await prisma.agent.create({
        data: {
          name: agent.name,
          title: agent.title,
          phone: agent.phone,
          email: agent.email || `${agent.name.toLowerCase().replace(/\s+/g, '.')}@vivaestate.lv`,
          image: imageUrl,
        },
        include: {
          reviews: true,
        },
      })

      createdAgents.push(createdAgent)

      // Sinhronizē tulkojumus
      await syncAgentTranslations([createdAgent])
    } catch (error) {
      console.error("Failed to create agent:", error)
      return NextResponse.json({ success: false, message: "Failed to create agent" }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true, agents: createdAgents })
}

export async function DELETE(req: NextRequest) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { success: false, message: "Agent ID is required" },
        { status: 400 }
      );
    }
    await prisma.agent.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Agent deleted" });
  } catch (error) {
    console.error("Failed to delete agent:", error);
    return NextResponse.json(
      { success: false, message: "Failed to delete agent" },
      { status: 500 }
    );
  }
}