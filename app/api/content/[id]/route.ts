import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { unlink } from "fs/promises"
import path from "path"

// GET - Fetch single content by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const content = await prisma.content.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json({ error: "Saturs nav atrasts" }, { status: 404 })
    }

    return NextResponse.json(content)
  } catch (error) {
    console.error("[CONTENT_GET_SINGLE]", error)
    return NextResponse.json({ error: "Kļūda ielādējot saturu" }, { status: 500 })
  }
}

// PUT - Update content (alternative to POST in main route)
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const data = await req.json()

    const content = await prisma.content.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error("[CONTENT_PUT]", error)
    return NextResponse.json({ error: "Kļūda atjauninot saturu" }, { status: 500 })
  }
}

// DELETE - Delete content and its files
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Get content to find associated files
    const content = await prisma.content.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json({ error: "Saturs nav atrasts" }, { status: 404 })
    }

    // Collect all files that need to be deleted
    const filesToDelete: string[] = []
    
    if (content.featuredImage) {
      filesToDelete.push(content.featuredImage)
    }
    
    if (content.videoFile) {
      filesToDelete.push(content.videoFile)
    }
    
    if (content.images && content.images.length > 0) {
      filesToDelete.push(...content.images)
    }

    // Delete files from filesystem
    for (const filePath of filesToDelete) {
      try {
        const fullPath = path.join(process.cwd(), "public", filePath)
        await unlink(fullPath)
      } catch (fileError) {
        console.error(`Error deleting file: ${filePath}`, fileError)
        // Continue even if file deletion fails
      }
    }

    // Delete content from database
    await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Saturs dzēsts veiksmīgi" })
  } catch (error) {
    console.error("[CONTENT_DELETE]", error)
    return NextResponse.json({ error: "Kļūda dzēšot saturu" }, { status: 500 })
  }
}