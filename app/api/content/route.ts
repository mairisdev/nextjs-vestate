import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'

if (process.env.CLOUDINARY_URL) {
  cloudinary.config(process.env.CLOUDINARY_URL)
} else {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })
}

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
          transformation: file.type.startsWith('image/') ? [
            { quality: 'auto:good', format: 'auto' }
          ] : undefined
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

function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const type = searchParams.get("type")
    const published = searchParams.get("published")

    if (id) {
      const content = await prisma.content.findUnique({
        where: { id }
      })
      return NextResponse.json(content)
    }

    const where: any = {}
    if (type) where.type = type.toUpperCase()
    if (published !== null) where.published = published === "true"

    const contents = await prisma.content.findMany({
      where,
      orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(contents)
  } catch (error) {
    console.error("[CONTENT_GET]", error)
    return NextResponse.json({ error: "Kļūda ielādējot saturu" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData()
    
    // Validate file sizes first
    const featuredImageFile = formData.get("featuredImage") as File | null
    if (featuredImageFile && featuredImageFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Galvenais attēls pārāk liels (max 5MB)" 
      }, { status: 413 })
    }

    const videoFileToUpload = formData.get("videoFile") as File | null
    if (videoFileToUpload && videoFileToUpload.size > 50 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Video fails pārāk liels (max 50MB)" 
      }, { status: 413 })
    }

    // Check additional images
    let totalAdditionalImagesSize = 0
    for (let i = 0; i < 20; i++) {
      const additionalImageFile = formData.get(`additionalImage${i}`) as File | null
      if (additionalImageFile && additionalImageFile.size > 0) {
        if (additionalImageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ 
            error: `Papildu attēls ${i + 1} pārāk liels (max 5MB)` 
          }, { status: 413 })
        }
        totalAdditionalImagesSize += additionalImageFile.size
      }
    }

    if (totalAdditionalImagesSize > 40 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Papildu attēli kopā pārāk lieli (max 40MB)" 
      }, { status: 413 })
    }
    
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

    // Handle existing files for updates
    const existingFeaturedImage = formData.get("existingFeaturedImage") as string || null
    const existingVideoFile = formData.get("existingVideoFile") as string || null
    const existingAdditionalImagesString = formData.get("existingAdditionalImages") as string || "[]"
    let existingAdditionalImages: string[] = []
    
    try {
      existingAdditionalImages = JSON.parse(existingAdditionalImagesString)
    } catch (e) {
      existingAdditionalImages = []
    }

    const tags = tagsString ? 
      tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    const slug = removeDiacritics(title.toLowerCase().replace(/\s+/g, "-"))

    let featuredImage = existingFeaturedImage
    let videoFile = existingVideoFile
    let additionalImages: string[] = [...existingAdditionalImages]

    const uploadPromises: Promise<{type: string, url: string, index?: number}>[] = []

    if (featuredImageFile && featuredImageFile.size > 0) {
      uploadPromises.push(
        uploadToCloudinary(featuredImageFile, 'content').then(url => ({ type: 'featured', url }))
      )
    }

    if (videoFileToUpload && videoFileToUpload.size > 0) {
      uploadPromises.push(
        uploadToCloudinary(videoFileToUpload, 'content/videos').then(url => ({ type: 'video', url }))
      )
    }

    const additionalImagePromises: Promise<{type: string, url: string, index: number}>[] = []
    for (let i = 0; i < 20; i++) {
      const additionalImageFile = formData.get(`additionalImage${i}`) as File | null
      if (additionalImageFile && additionalImageFile.size > 0) {
        additionalImagePromises.push(
          uploadToCloudinary(additionalImageFile, 'content').then(url => ({ type: 'additional', url, index: i }))
        )
      }
    }

    const totalUploads = uploadPromises.length + additionalImagePromises.length
    if (totalUploads > 0) {
      try {
        const [mainUploads, additionalUploads] = await Promise.all([
          Promise.all(uploadPromises),
          Promise.all(additionalImagePromises)
        ])

        for (const upload of mainUploads) {
          if (upload.type === 'featured') {
            featuredImage = upload.url
          } else if (upload.type === 'video') {
            videoFile = upload.url
          }
        }

        // Add new additional images to existing ones
        const newAdditionalImages = additionalUploads
          .sort((a, b) => a.index - b.index)
          .map(upload => upload.url)
        
        additionalImages = [...additionalImages, ...newAdditionalImages]
        
      } catch (uploadError) {
        console.error('❌ Upload failed:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt failus" 
        }, { status: 500 })
      }
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
      videoUrl: videoUrl || null,
      videoFile,
      images: additionalImages,
      author,
      tags,
      metaTitle,
      metaDescription,
      updatedAt: new Date()
    }

    let result
    if (id) {
      // Update existing content
      result = await prisma.content.update({
        where: { id },
        data
      })
    } else {
      // Create new content
      result = await prisma.content.create({
        data: {
          ...data,
          createdAt: new Date()
        }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[CONTENT_POST]", error)
    const errorMessage = error instanceof Error ? error.message : "Kļūda saglabājot saturu"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID nav norādīts" }, { status: 400 })
    }

    await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[CONTENT_DELETE]", error)
    return NextResponse.json({ error: "Kļūda dzēšot saturu" }, { status: 500 })
  }
}