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

// Funkcija public ID iegūšanai no Cloudinary URL
function getCloudinaryPublicId(url: string): string | null {
  try {
    if (!url.includes('cloudinary.com')) return null
    
    const parts = url.split('/')
    const versionIndex = parts.findIndex(part => part.startsWith('v'))
    
    if (versionIndex !== -1 && versionIndex < parts.length - 1) {
      const fileName = parts[versionIndex + 1]
      return fileName.split('.')[0] // noņemam faila paplašinājumu
    }
    
    // Fallback - mēģinām iegūt no faila nosaukuma
    const fileName = parts[parts.length - 1]
    return fileName.split('.')[0]
  } catch (error) {
    console.error('Error extracting public ID from URL:', error)
    return null
  }
}

// Cloudinary delete funkcija
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

// DELETE - Delete content and its files from Cloudinary
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

    // Collect all Cloudinary URLs that need to be deleted
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

    console.log('🗑️ Deleting content files from Cloudinary:', {
      contentId: id,
      title: content.title,
      filesToDelete: cloudinaryUrls.length
    })

    // Delete files from Cloudinary
    for (const cloudinaryUrl of cloudinaryUrls) {
      try {
        const publicId = getCloudinaryPublicId(cloudinaryUrl)
        if (publicId) {
          await deleteFromCloudinary(publicId)
          console.log(`✅ Deleted from Cloudinary: ${publicId}`)
        }
      } catch (fileError) {
        console.error(`❌ Error deleting file from Cloudinary: ${cloudinaryUrl}`, fileError)
        // Continue even if file deletion fails
      }
    }

    // Delete content from database
    await prisma.content.delete({
      where: { id }
    })

    console.log('✅ Content deleted successfully:', id)

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