import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { randomUUID } from "crypto"
import { removeDiacritics } from "@/lib/utils"
import { uploadImage } from '@/lib/s3'

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
}

// Fetch all blog posts
export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { date: "desc" } })
  return NextResponse.json(posts)
}

// Create or update a blog post
export async function POST(req: Request) {
  try {
    const formData = await req.formData()

    const title = formData.get("title") as string
    const date = formData.get("date") as string
    const excerpt = formData.get("excerpt") as string
    const shortDescription = formData.get("shortDescription") as string
    const existingImageUrl = formData.get("existingImageUrl") as string
    const file = formData.get("image") as File | null
    const id = formData.get("id") as string // Get the blog ID from the form data

    let imageUrl = existingImageUrl

    // If image is uploaded, save it to Cloudinary
    if (file && file.size > 0) {
      console.log('📁 Uploading blog image to Cloudinary:', {
        name: file.name,
        size: file.size,
        type: file.type
      })
      
      // Validējam faila izmēru (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Attēls pārāk liels (max 10MB)" 
        }, { status: 413 })
      }
      
      try {
        imageUrl = await uploadToCloudinary(file, 'blog')
        console.log('✅ Blog image uploaded successfully:', imageUrl)
      } catch (uploadError) {
        console.error('❌ Failed to upload blog image:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt attēlu" 
        }, { status: 500 })
      }
    }

    const slug = removeDiacritics(title.toLowerCase().replace(/\s+/g, "-"))

    // If an ID is provided, update the existing blog post; otherwise, create a new one
    let post;
    if (id) {
      post = await prisma.blogPost.update({
        where: { id },
        data: { title, date, excerpt, shortDescription, slug, imageUrl }
      })
    } else {
      post = await prisma.blogPost.create({
        data: { title, date, excerpt, shortDescription, slug, imageUrl }
      })
    }

    return NextResponse.json(post)
  } catch (error) {
    console.error("[BLOG_POST]", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to save blog post"
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}