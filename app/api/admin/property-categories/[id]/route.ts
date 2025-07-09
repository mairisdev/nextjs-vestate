import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import path from "path"
import { writeFile, mkdir } from "fs/promises"
import fs from "fs"
import { v4 as uuidv4 } from "uuid"

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
    const formData = await request.formData();
    const uploadDir = path.join(process.cwd(), "public", "categories");

    if (!fs.existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }
  // Move the closing brace to the end of the function and use the correct variable name 'formData'
  const name = String(formData.get("name") || "")
  const slug = String(formData.get("slug") || "")
  const description = String(formData.get("description") || "")
  const isVisible = formData.get("isVisible") === "true"
  const order = parseInt(String(formData.get("order"))) || 0

  let imageUrl = undefined
  const file = formData.get("image")

  if (file instanceof File && file.size > 0) {
    const ext = path.extname(file.name)
    const filename = `${uuidv4()}${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const filePath = path.join(uploadDir, filename)

    await writeFile(filePath, buffer)
    imageUrl = `/categories/${filename}`
  }

  try {
    const updated = await prisma.propertyCategory.update({
      where: { id },
      data: {
        name,
        slug,
        description,
        isVisible,
        order,
        ...(imageUrl && { image: imageUrl }), // Tikai ja jauns attēls
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("PUT kategorijas kļūda:", error)
    return NextResponse.json({ error: "Kļūda atjauninot kategoriju" }, { status: 500 })
  }
}
