import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// PATCH - Toggle published status
export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { published } = await req.json()

    // Validate that published is a boolean
    if (typeof published !== "boolean") {
      return NextResponse.json({ error: "Published laukam jābūt boolean vērtībai" }, { status: 400 })
    }

    // Check if content exists
    const existingContent = await prisma.content.findUnique({
      where: { id }
    })

    if (!existingContent) {
      return NextResponse.json({ error: "Saturs nav atrasts" }, { status: 404 })
    }

    // Update the published status
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        published,
        publishedAt: published ? new Date() : null, // Set publishedAt when publishing, null when unpublishing
        updatedAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: published ? "Saturs publicēts" : "Saturs noņemts no publikācijas",
      content: updatedContent
    })
  } catch (error) {
    console.error("[CONTENT_TOGGLE_PUBLISHED]", error)
    return NextResponse.json({ error: "Kļūda mainot publikācijas statusu" }, { status: 500 })
  }
}