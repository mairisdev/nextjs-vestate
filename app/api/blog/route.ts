import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { writeFile } from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"
import { removeDiacritics } from "@/lib/utils"

// Fetch all blog posts
export async function GET() {
  const posts = await prisma.blogPost.findMany({ orderBy: { date: "desc" } })
  return NextResponse.json(posts)
}

// Create or update a blog post
export async function POST(req: Request) {
  const formData = await req.formData()

  const title = formData.get("title") as string
  const date = formData.get("date") as string
  const excerpt = formData.get("excerpt") as string
  const existingImageUrl = formData.get("existingImageUrl") as string
  const file = formData.get("image") as File | null
  const id = formData.get("id") as string // Get the blog ID from the form data

  let imageUrl = existingImageUrl

  // If image is uploaded, save it
  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const fileName = `${randomUUID()}-${file.name.replace(/\s+/g, "_")}`
    const filePath = path.join(process.cwd(), "public/blog", fileName)
    await writeFile(filePath, buffer)
    imageUrl = `/blog/${fileName}`
  }

  const slug = removeDiacritics(title.toLowerCase().replace(/\s+/g, "-"))

  // If an ID is provided, update the existing blog post; otherwise, create a new one
  let post;
  if (id) {
    post = await prisma.blogPost.update({
      where: { id },
      data: { title, date, excerpt, slug, imageUrl },
    })
  } else {
    post = await prisma.blogPost.create({
      data: { title, date, excerpt, slug, imageUrl },
    })
  }

  return NextResponse.json(post)
}
