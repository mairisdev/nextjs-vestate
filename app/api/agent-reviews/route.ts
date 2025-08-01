// app/api/agent-reviews/route.ts (JAUNS FAILS)
import { NextResponse, NextRequest } from "next/server"
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
          transformation: [
            { width: 400, height: 400, crop: 'fill', quality: 'auto' }
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

// CREATE - Pievieno jaunu atsauksmi
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const agentId = formData.get("agentId") as string
    const content = formData.get("content") as string
    const author = formData.get("author") as string
    const rating = parseInt(formData.get("rating") as string) || 5
    const imageFile = formData.get("image") as File | null

    if (!agentId || !content || !author) {
      return NextResponse.json({ 
        success: false, 
        message: "agentId, content, un author ir obligāti" 
      }, { status: 400 })
    }

    let imageUrl = null
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadToCloudinary(imageFile, 'agents/reviews')
      } catch (error) {
        console.error("Failed to upload review image:", error)
      }
    }

    const review = await prisma.agentReview.create({
      data: {
        agentId,
        content,
        author,
        rating,
        imageUrl,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error("Error creating review:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to create review" 
    }, { status: 500 })
  }
}

// UPDATE - Atjaunina atsauksmi
export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData()
    
    const reviewId = formData.get("reviewId") as string
    const content = formData.get("content") as string
    const author = formData.get("author") as string
    const rating = parseInt(formData.get("rating") as string) || 5
    const imageFile = formData.get("image") as File | null
    const existingImageUrl = formData.get("existingImageUrl") as string

    if (!reviewId || !content || !author) {
      return NextResponse.json({ 
        success: false, 
        message: "reviewId, content, un author ir obligāti" 
      }, { status: 400 })
    }

    let imageUrl = existingImageUrl
    if (imageFile && imageFile.size > 0) {
      try {
        imageUrl = await uploadToCloudinary(imageFile, 'agents/reviews')
      } catch (error) {
        console.error("Failed to upload review image:", error)
      }
    }

    const review = await prisma.agentReview.update({
      where: { id: reviewId },
      data: {
        content,
        author,
        rating,
        imageUrl,
      },
    })

    return NextResponse.json({ success: true, review })
  } catch (error) {
    console.error("Error updating review:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to update review" 
    }, { status: 500 })
  }
}

// DELETE - Dzēš atsauksmi
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const reviewId = searchParams.get("reviewId")

    if (!reviewId) {
      return NextResponse.json({ 
        success: false, 
        message: "reviewId ir obligāts" 
      }, { status: 400 })
    }

    await prisma.agentReview.delete({
      where: { id: reviewId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting review:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Failed to delete review" 
    }, { status: 500 })
  }
}