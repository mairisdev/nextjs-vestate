import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { uploadImage, deleteImage } from '@/lib/s3'

async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
}

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

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    const existingFeaturedImage = formData.get("existingFeaturedImage") as string || null
    const existingVideoFile = formData.get("existingVideoFile") as string || null
    const existingAdditionalImagesString = formData.get("existingAdditionalImages") as string || "[]"
    const imagesToDeleteString = formData.get("imagesToDelete") as string || "[]"

    let existingAdditionalImages: string[] = []
    let imagesToDelete: string[] = []
    
    try {
      existingAdditionalImages = JSON.parse(existingAdditionalImagesString)
      imagesToDelete = JSON.parse(imagesToDeleteString)
    } catch (e) {
      console.error("Error parsing JSON:", e)
    }

    const tags = tagsString ? 
      tagsString.split(",").map(tag => tag.trim()).filter(Boolean) : []

    let featuredImage = existingFeaturedImage
    let videoFile = existingVideoFile
    let additionalImages: string[] = [...existingAdditionalImages]

    // Delete marked files from S3
    for (const urlToDelete of imagesToDelete) {
      try {
        await deleteImage(urlToDelete)
        console.log(`✅ Deleted from S3: ${urlToDelete}`)
      } catch (deleteError) {
        console.error(`❌ Error deleting file from S3: ${urlToDelete}`, deleteError)
      }
    }

    // Upload new files
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
        if (additionalImageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json({ 
            error: `Papildu attēls ${i + 1} pārāk liels (max 5MB)` 
          }, { status: 413 })
        }
        
        additionalImagePromises.push(
          uploadToCloudinary(additionalImageFile, 'content').then(url => ({ type: 'additional', url, index: i }))
        )
      }
    }

    if (uploadPromises.length > 0 || additionalImagePromises.length > 0) {
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

    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title,
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
    })

    return NextResponse.json(updatedContent)
  } catch (error) {
    console.error("[CONTENT_PUT]", error)
    const errorMessage = error instanceof Error ? error.message : "Kļūda atjauninot saturu"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    const content = await prisma.content.findUnique({
      where: { id }
    })

    if (!content) {
      return NextResponse.json({ error: "Saturs nav atrasts" }, { status: 404 })
    }

    const urlsToDelete: string[] = []

    if (content.featuredImage && typeof content.featuredImage === 'string' && content.featuredImage.startsWith('http')) {
      urlsToDelete.push(content.featuredImage)
    }

    if (content.videoFile && typeof content.videoFile === 'string' && content.videoFile.startsWith('http')) {
      urlsToDelete.push(content.videoFile)
    }

    if (content.images && content.images.length > 0) {
      content.images.forEach(imageUrl => {
        if (imageUrl && typeof imageUrl === 'string' && imageUrl.startsWith('http')) {
          urlsToDelete.push(imageUrl)
        }
      })
    }

    for (const url of urlsToDelete) {
      try {
        await deleteImage(url)
      } catch (fileError) {
        console.error(`❌ Error deleting file from S3: ${url}`, fileError)
      }
    }

    await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Saturs dzēsts veiksmīgi",
      deletedFiles: urlsToDelete.length
    })
  } catch (error) {
    console.error("[CONTENT_DELETE]", error)
    const errorMessage = error instanceof Error ? error.message : "Kļūda dzēšot saturu"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}