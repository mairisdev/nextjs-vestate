import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { syncThirdSectionTranslations } from "@/lib/translationSync"

export async function GET() {
  try {
    const section = await prisma.thirdSection.findUnique({
      where: { id: "third-section" },
    })
    return NextResponse.json(section || {}, { status: 200 })
  } catch (error) {
    console.error("Error fetching third section:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { heading, subheading, services, imageUrl } = await req.json()

    const updatedSection = await prisma.thirdSection.upsert({
      where: { id: "third-section" },
      update: {
        heading,
        subheading,
        services,
        imageUrl,
      },
      create: {
        id: "third-section",
        heading,
        subheading,
        services,
        imageUrl,
      },
    })

    await syncThirdSectionTranslations(updatedSection)

    return NextResponse.json(updatedSection, { status: 200 })
  } catch (error) {
    console.error("Error updating third section:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
