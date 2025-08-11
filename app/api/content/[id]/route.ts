import { NextResponse } from "next/server"
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

function getCloudinaryPublicId(url: string): string | null {
  try {
    if (!url.includes('cloudinary.com')) return null
    
    const parts = url.split('/')
    const versionIndex = parts.findIndex(part => part.startsWith('v'))
    
    if (versionIndex !== -1 && versionIndex < parts.length - 1) {
      const fileName = parts[versionIndex + 1]
      return fileName.split('.')[0]
    }
    
    const fileName = parts[parts.length - 1]
    return fileName.split('.')[0]
  } catch (error) {
    console.error('Error extracting public ID from URL:', error)
    return null
  }
}

async function deleteFromCloudinary(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error)
        reject(error)
      } else {
        console.log('Cloudinary delete result:', result)
        resolve()
      }
    })
  })
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

    // Delete marked files from Cloudinary
    for (const urlToDelete of imagesToDelete) {
      try {
        const publicId = getCloudinaryPublicId(urlToDelete)
        if (publicId) {
          await deleteFromCloudinary(publicId)
          console.log(`✅ Deleted from Cloudinary: ${publicId}`)
        }
      } catch (deleteError) {
        console.error(`❌ Error deleting file from Cloudinary: ${urlToDelete}`, deleteError)
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

    const cloudinaryUrls: string[] = []
    
    if (content.featuredImage && content.featuredImage.includes('cloudinary.com')) {
      cloudinaryUrls.push(content.featuredImage)
    }
    
    if (content.videoFile && content.videoFile.includes('cloudinary.com')) {
      cloudinaryUrls.push(content.videoFile)
    }
    
    if (content.images && content.images.length > 0) {
      content.images.forEach(imageUrl => {
        if (imageUrl.includes('cloudinary.com')) {
          cloudinaryUrls.push(imageUrl)
        }
      })
    }

    for (const cloudinaryUrl of cloudinaryUrls) {
      try {
        const publicId = getCloudinaryPublicId(cloudinaryUrl)
        if (publicId) {
          await deleteFromCloudinary(publicId)
        }
      } catch (fileError) {
        console.error(`❌ Error deleting file from Cloudinary: ${cloudinaryUrl}`, fileError)
      }
    }

    await prisma.content.delete({
      where: { id }
    })

    return NextResponse.json({ 
      success: true, 
      message: "Saturs dzēsts veiksmīgi",
      deletedFiles: cloudinaryUrls.length
    })
  } catch (error) {
    console.error("[CONTENT_DELETE]", error)
    const errorMessage = error instanceof Error ? error.message : "Kļūda dzēšot saturu"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}