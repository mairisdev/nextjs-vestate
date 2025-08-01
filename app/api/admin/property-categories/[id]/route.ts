// app/api/admin/property-categories/[id]/route.ts (AIZVIETO PILNĪBĀ)
import { prisma } from "@/lib/db"
import { NextResponse } from "next/server"
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
          transformation: [
            { width: 400, height: 300, crop: 'fill', quality: 'auto' }
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