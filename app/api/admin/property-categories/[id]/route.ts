// app/api/admin/property-categories/[id]/route.ts (AIZVIETO PILNĪBĀ)
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
import { uploadImage } from '@/lib/s3'

// Augšupielāde uz S3 (konvertē uz webp)
async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  return uploadImage(file, folder)
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const formData = await request.formData();
  
  const name = String(formData.get("name") || "")
  const slug = String(formData.get("slug") || "")
  const description = String(formData.get("description") || "")
  const isVisible = formData.get("isVisible") === "true"
  const order = parseInt(String(formData.get("order"))) || 0

  let imageUrl = undefined
  const file = formData.get("image")

  if (file instanceof File && file.size > 0) {
    try {
      imageUrl = await uploadToCloudinary(file, 'categories')
    } catch (error) {
      console.error("Failed to upload category image:", error)
      return NextResponse.json({ error: "Neizdevās augšupielādēt attēlu" }, { status: 500 })
    }
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

    await prisma.propertyCategory.delete({
      where: { id }
    });

    return NextResponse.json({ message: "Kategorija veiksmīgi dzēsta" });
  } catch (error) {
    console.error("DELETE kategorijas kļūda:", error)
    return NextResponse.json({ error: "Kļūda dzēšot kategoriju" }, { status: 500 })
  }
}