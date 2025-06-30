import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    const data = await prisma.secondSection.findFirst()
    return NextResponse.json(data || {}, { status: 200 })
  } catch (error) {
    console.error("Error fetching second section:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { heading, imageUrl, reasons } = await req.json()

    if (!heading || !imageUrl || !reasons || !Array.isArray(reasons)) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const updated = await prisma.secondSection.upsert({
      where: { id: "second-section-static-id" }, // izmantojam statisku ID
      update: { heading, imageUrl, reasons },
      create: {
        id: "second-section-static-id",
        heading,
        imageUrl,
        reasons,
      },
    })

    return NextResponse.json(updated, { status: 200 })
  } catch (error) {
    console.error("Error updating second section:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
