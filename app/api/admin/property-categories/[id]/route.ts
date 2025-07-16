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

// PIEVIENO ŠO DELETE METODI:
export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    // Pārbaudām, vai kategorijai ir piesaistīti īpašumi
    const propertiesCount = await prisma.property.count({
      where: { categoryId: id }
    });

    if (propertiesCount > 0) {
      return NextResponse.json(
        { error: `Nevar dzēst kategoriju, jo tai ir piesaistīti ${propertiesCount} īpašumi` }, 
        { status: 400 }
      );
    }

    // Iegūstam kategoriju, lai dzēstu attēlu
    const category = await prisma.propertyCategory.findUnique({
      where: { id }
    });

    if (!category) {
      return NextResponse.json({ error: "Kategorija nav atrasta" }, { status: 404 });
    }

    // Dzēšam kategorijas attēlu, ja tāds ir
    if (category.image) {
      try {
        const imagePath = path.join(process.cwd(), "public", category.image);
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      } catch (error) {
        console.error("Error deleting category image:", error);
        // Turpinām dzēšanu, pat ja attēla dzēšana neizdevās
      }
    }

    // Dzēšam kategoriju no datubāzes
    await prisma.propertyCategory.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error("DELETE kategorijas kļūda:", error)
    return NextResponse.json({ error: "Kļūda dzēšot kategoriju" }, { status: 500 })
  }
}