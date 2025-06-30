import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const section = await prisma.firstSection.findFirst()
    return new Response(JSON.stringify(section), { status: 200 })
  } catch (error) {
    console.error("Error fetching first section:", error)
    return new Response("Error fetching first section", { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    const headline = body.headline ?? ""
    const buttonText = body.buttonText ?? ""
    const buttonLink = body.buttonLink ?? ""
    let backgroundImage = body.backgroundImage ?? ""

    if (!backgroundImage) {
      const existing = await prisma.firstSection.findUnique({
        where: { id: "cmchdj0eg0001mc2cmvk7g7mc" }
      })
      backgroundImage = existing?.backgroundImage || ""
    }

    const updatedSection = await prisma.firstSection.upsert({
      where: { id: "cmchdj0eg0001mc2cmvk7g7mc" },
      update: {
        headline,
        buttonText,
        buttonLink,
        backgroundImage,
      },
      create: {
        id: "cmchdj0eg0001mc2cmvk7g7mc",
        headline,
        buttonText,
        buttonLink,
        backgroundImage,
      },
    })

    return NextResponse.json(updatedSection, { status: 200 })
  } catch (error) {
    console.error("Error updating first section:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
