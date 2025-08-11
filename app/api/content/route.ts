import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { v2 as cloudinary } from 'cloudinary'

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

// Helper funkcija diakritisko zīmju noņemšanai
function removeDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

// GET - Retrieve content
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

// POST - Create or update content ar paralēlo augšupielādi
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

    console.log('📊 Starting parallel upload process...')

    // Handle tags
    const tags = tagsString ? 
      tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    // Generate slug
    const slug = removeDiacritics(title.toLowerCase().replace(/\s+/g, "-"))

    // Inicializējam URL mainīgos
    let featuredImage = formData.get("existingFeaturedImage") as string || null
    let videoFile = formData.get("existingVideoFile") as string || null
    let additionalImages: string[] = []

    // Paralēla failu augšupielāde
    const uploadPromises: Promise<{type: string, url: string, index?: number}>[] = []

    // Featured image upload
    const featuredImageFile = formData.get("featuredImage") as File | null
    if (featuredImageFile && featuredImageFile.size > 0) {
      console.log(`📁 Queuing featured image upload (${Math.round(featuredImageFile.size / 1024)}KB)`)
      
      // Validējam faila izmēru un tipu
      if (featuredImageFile.size > 5 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Galvenais attēls pārāk liels (max 5MB)" 
        }, { status: 413 })
      }
      
      if (!featuredImageFile.type.startsWith('image/')) {
        return NextResponse.json({ 
          error: "Galvenais attēls nav derīgs attēla fails" 
        }, { status: 400 })
      }
      
      uploadPromises.push(
        uploadToCloudinary(featuredImageFile, 'content').then(url => ({ type: 'featured', url }))
      )
    }

    // Video file upload
    const videoFileToUpload = formData.get("videoFile") as File | null
    if (videoFileToUpload && videoFileToUpload.size > 0) {
      console.log(`🎬 Queuing video upload (${Math.round(videoFileToUpload.size / 1024 / 1024)}MB)`)
      
      if (videoFileToUpload.size > 50 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Video fails pārāk liels (max 50MB)" 
        }, { status: 413 })
      }
      
      uploadPromises.push(
        uploadToCloudinary(videoFileToUpload, 'content/videos').then(url => ({ type: 'video', url }))
      )
    }

    // Additional images upload
    const additionalImagePromises: Promise<{type: string, url: string, index: number}>[] = []
    for (let i = 0; i < 20; i++) {
      const additionalImageFile = formData.get(`additionalImage${i}`) as File | null
      if (additionalImageFile && additionalImageFile.size > 0) {
        console.log(`🖼️ Queuing additional image ${i} (${Math.round(additionalImageFile.size / 1024)}KB)`)
        
        if (additionalImageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ 
            error: `Papildu attēls ${i + 1} pārāk liels (max 5MB)` 
          }, { status: 413 })
        }
        
        if (!additionalImageFile.type.startsWith('image/')) {
          return NextResponse.json({ 
            error: `Papildu attēls ${i + 1} nav derīgs attēla fails` 
          }, { status: 400 })
        }
        
        additionalImagePromises.push(
          uploadToCloudinary(additionalImageFile, 'content').then(url => ({ type: 'additional', url, index: i }))
        )
      }
    }

    // Izpildām visas augšupielādes paralēli
    const totalUploads = uploadPromises.length + additionalImagePromises.length
    if (totalUploads > 0) {
      console.log(`🚀 Starting ${totalUploads} parallel uploads...`)
      const startTime = Date.now()

      try {
        const [mainUploads, additionalUploads] = await Promise.all([
          Promise.all(uploadPromises),
          Promise.all(additionalImagePromises)
        ])

        const uploadTime = Date.now() - startTime
        console.log(`✅ All uploads completed in ${uploadTime}ms`)

        // Apstrādājam galvenos upload rezultātus
        for (const upload of mainUploads) {
          if (upload.type === 'featured') {
            featuredImage = upload.url
            console.log('✅ Featured image uploaded:', featuredImage)
          } else if (upload.type === 'video') {
            videoFile = upload.url
            console.log('✅ Video uploaded:', videoFile)
          }
        }

        // Kārtojam papildu attēlus pareizajā secībā
        additionalImages = additionalUploads
          .sort((a, b) => a.index - b.index)
          .map(upload => upload.url)
        
        console.log(`✅ Additional images uploaded: ${additionalImages.length}`)
        
      } catch (uploadError) {
        console.error('❌ Parallel upload failed:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt failus" 
        }, { status: 500 })
      }
    }

    console.log(`📋 Final summary - Featured: ${featuredImage ? '✅' : '❌'}, Video: ${videoFile ? '✅' : '❌'}, Additional: ${additionalImages.length}`)

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
      console.log('✅ Content updated successfully')
    } else {
      // Create new content
      result = await prisma.content.create({
        data: {
          ...data,
          createdAt: new Date()
        }
      })
      console.log('✅ Content created successfully')
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[CONTENT_POST]", error)
    const errorMessage = error instanceof Error ? error.message : "Kļūda saglabājot saturu"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// DELETE - Remove content
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