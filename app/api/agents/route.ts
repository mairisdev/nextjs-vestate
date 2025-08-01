// app/api/agents/route.ts (AIZVIETO PILNĪBĀ)
import { NextResponse, NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'
import { syncAgentTranslations } from "@/lib/translationSync"

// Cloudinary konfigurācija
if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

// Cloudinary upload funkcija
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return new Promise(async (resolve, reject) => {
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const timestamp = Date.now()
      const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
      
      cloudinary.uploader.upload_stream(
        {
          public_id: `${timestamp}-${safeFileName}`,
          folder: folder,
          resource_type: 'auto',
          transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            resolve(result!.secure_url)
          }
        }
      ).end(buffer)
    } catch (error) {
      reject(error)
    }
  })
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
          email: agent.email || `${agent.name.toLowerCase().replace(/\s+/g, '.')}@vestate.lv`,
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