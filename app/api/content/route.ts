import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary' 
import { randomUUID } from "crypto"
import { removeDiacritics } from "@/lib/utils"

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
            { width: 1200, height: 800, crop: 'limit', quality: 'auto' }
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
    const tags = tagsString ? 
      tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    // Generate slug
    const slug = removeDiacritics(title.toLowerCase().replace(/\s+/g, "-"))

    // Handle featured image upload to Cloudinary
    let featuredImage = formData.get("existingFeaturedImage") as string || null
    const featuredImageFile = formData.get("featuredImage") as File | null
    
    if (featuredImageFile && featuredImageFile.size > 0) {
      console.log('📁 Uploading featured image to Cloudinary')
      
      // Validējam faila izmēru (max 10MB)
      if (featuredImageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Galvenais attēls pārāk liels (max 10MB)" 
        }, { status: 413 })
      }
      
      try {
        featuredImage = await uploadToCloudinary(featuredImageFile, 'content')
        console.log('✅ Featured image uploaded:', featuredImage)
      } catch (uploadError) {
        console.error('❌ Failed to upload featured image:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt galveno attēlu" 
        }, { status: 500 })
      }
    }

    // Handle video file upload to Cloudinary
    let videoFile = formData.get("existingVideoFile") as string || null
    const videoFileUpload = formData.get("videoFile") as File | null
    
    if (videoFileUpload && videoFileUpload.size > 0) {
      console.log('📁 Uploading video file to Cloudinary')
      
      // Validējam faila izmēru (max 100MB video failiem)
      if (videoFileUpload.size > 100 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Video fails pārāk liels (max 100MB)" 
        }, { status: 413 })
      }
      
      try {
        videoFile = await uploadToCloudinary(videoFileUpload, 'content/videos')
        console.log('✅ Video file uploaded:', videoFile)
      } catch (uploadError) {
        console.error('❌ Failed to upload video file:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt video failu" 
        }, { status: 500 })
      }
    }

    // Handle additional images upload to Cloudinary
    const additionalImages: string[] = []
    let imageIndex = 0
    
    while (true) {
      const imageFile = formData.get(`additionalImage${imageIndex}`) as File | null
      if (!imageFile || imageFile.size === 0) break
      
      console.log(`📁 Uploading additional image ${imageIndex + 1} to Cloudinary`)
      
      // Validējam faila izmēru (max 10MB)
      if (imageFile.size > 10 * 1024 * 1024) {
        console.log(`❌ Additional image ${imageIndex + 1} too large, skipping`)
        imageIndex++
        continue
      }
      
      try {
        const imageUrl = await uploadToCloudinary(imageFile, 'content')
        additionalImages.push(imageUrl)
        console.log(`✅ Additional image ${imageIndex + 1} uploaded:`, imageUrl)
      } catch (uploadError) {
        console.error(`❌ Failed to upload additional image ${imageIndex + 1}:`, uploadError)
        // Turpinām ar citiem attēliem
      }
      
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