import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { removeDiacritics } from "@/lib/utils"

// GET - Fetch content by type or all
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type")
    const published = searchParams.get("published")

    const where: any = {}
    
    if (type) {
      where.type = type.toUpperCase()
    }
    
    if (published === "true") {
      where.published = true
    }

    const content = await prisma.content.findMany({
      where,
      orderBy: { publishedAt: "desc" },
    })

    return NextResponse.json(content)
  } catch (error) {
    console.error("[CONTENT_GET]", error)
    return NextResponse.json({ error: "Kļūda ielādējot saturu" }, { status: 500 })
  }
}

// POST - Create or update content
export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    const id = formData.get("id") as string | null
    const title = formData.get("title") as string
    const content = formData.get("content") as string
    const excerpt = formData.get("excerpt") as string
    const type = formData.get("type") as string
    const published = formData.get("published") === "true"
    const videoUrl = formData.get("videoUrl") as string | null
    const author = formData.get("author") as string | null
    const tagsString = formData.get("tags") as string
    const metaTitle = formData.get("metaTitle") as string | null
    const metaDescription = formData.get("metaDescription") as string | null

    // Handle tags
    const tags = tagsString ? tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    // Generate slug
    const slug = removeDiacritics(title.toLowerCase().replace(/\s+/g, "-"))

    // Handle featured image upload
    let featuredImage = formData.get("existingFeaturedImage") as string || null
    const featuredImageFile = formData.get("featuredImage") as File | null
    
    if (featuredImageFile && featuredImageFile.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/content")
      await mkdir(uploadDir, { recursive: true })
      
      const fileName = `${randomUUID()}-${featuredImageFile.name.replace(/\s+/g, "_")}`
      const filePath = path.join(uploadDir, fileName)
      const buffer = Buffer.from(await featuredImageFile.arrayBuffer())
      await writeFile(filePath, buffer)
      featuredImage = `/content/${fileName}`
    }

    // Handle video file upload
    let videoFile = formData.get("existingVideoFile") as string || null
    const videoFileUpload = formData.get("videoFile") as File | null
    
    if (videoFileUpload && videoFileUpload.size > 0) {
      const uploadDir = path.join(process.cwd(), "public/content/videos")
      await mkdir(uploadDir, { recursive: true })
      
      const fileName = `${randomUUID()}-${videoFileUpload.name.replace(/\s+/g, "_")}`
      const filePath = path.join(uploadDir, fileName)
      const buffer = Buffer.from(await videoFileUpload.arrayBuffer())
      await writeFile(filePath, buffer)
      videoFile = `/content/videos/${fileName}`
    }

    // Handle additional images
    const additionalImages: string[] = []
    let imageIndex = 0
    
    while (true) {
      const imageFile = formData.get(`additionalImage${imageIndex}`) as File | null
      if (!imageFile || imageFile.size === 0) break
      
      const uploadDir = path.join(process.cwd(), "public/content")
      await mkdir(uploadDir, { recursive: true })
      
      const fileName = `${randomUUID()}-${imageFile.name.replace(/\s+/g, "_")}`
      const filePath = path.join(uploadDir, fileName)
      const buffer = Buffer.from(await imageFile.arrayBuffer())
      await writeFile(filePath, buffer)
      additionalImages.push(`/content/${fileName}`)
      imageIndex++
    }

    const data = {
      title,
      slug,
      excerpt,
      content,
      type: type.toUpperCase() as any,
      published,
      publishedAt: published ? new Date() : null,
      featuredImage,
      videoUrl,
      videoFile,
      images: additionalImages,
      tags,
      author,
      metaTitle,
      metaDescription,
    }

    let result
    if (id) {
      // Update existing
      result = await prisma.content.update({
        where: { id },
        data,
      })
    } else {
      // Create new
      result = await prisma.content.create({
        data,
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[CONTENT_POST]", error)
    return NextResponse.json({ error: "Kļūda saglabājot saturu" }, { status: 500 })
  }
}
