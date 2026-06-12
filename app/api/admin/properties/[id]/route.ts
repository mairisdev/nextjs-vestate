// app/api/admin/properties/[id]/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { uploadImage, deleteImage } from '@/lib/s3'
import { PropertyStatus, PropertyVisibility } from "@prisma/client"

// Helper funkcija slug izveidošanai
function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[āä]/g, 'a')
    .replace(/[ēě]/g, 'e')
    .replace(/[īì]/g, 'i')
    .replace(/[ōö]/g, 'o')
    .replace(/[ūü]/g, 'u')
    .replace(/[ļ]/g, 'l')
    .replace(/[ķ]/g, 'k')
    .replace(/[ģ]/g, 'g')
    .replace(/[č]/g, 'c')
    .replace(/[š]/g, 's')
    .replace(/[ž]/g, 'z')
    .replace(/[ņ]/g, 'n')
    .replace(/[ř]/g, 'r')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim()
}

// Attēla augšupielādes funkcija
async function uploadToCloudinary(file: File, publicId: string): Promise<string> {
  return uploadImage(file, 'properties', { publicId })
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    console.log('Loading property with ID:', id)
    
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        agent: true
      }
    })

    if (!property) {
      console.log('Property not found:', id)
      return NextResponse.json({ error: "Īpašums nav atrasts" }, { status: 404 })
    }

    console.log('Property found:', property.title)
    return NextResponse.json(property)
  } catch (error) {
    console.error('Error loading property:', error)
    return NextResponse.json({ error: "Kļūda ielādējot īpašumu" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  console.log('🔄 PUT /api/admin/properties/[id] - START')
  
  try {
    const { id } = await params
    console.log('Property ID to update:', id)
    
    const formData = await req.formData()
    
    // Extract form values
    const title = formData.get("title")?.toString() || ""
    const description = formData.get("description")?.toString() || ""
    const price = parseFloat(formData.get("price")?.toString() || "0")
    const currency = formData.get("currency")?.toString() || "EUR"
    const address = formData.get("address")?.toString() || ""
    const city = formData.get("city")?.toString() || ""
    const district = formData.get("district")?.toString() || null
    const videoUrl = formData.get("videoUrl")?.toString() || null
    const rooms = formData.get("rooms") ? parseInt(formData.get("rooms")?.toString() || "0") : null
    const area = formData.get("area") ? parseFloat(formData.get("area")?.toString() || "0") : null
    const floor = formData.get("floor") ? parseInt(formData.get("floor")?.toString() || "0") : null
    const totalFloors = formData.get("totalFloors") ? parseInt(formData.get("totalFloors")?.toString() || "0") : null
    const series = formData.get("series")?.toString() || null
    const hasElevator = formData.get("hasElevator") === "true"
    const amenities = formData.getAll("amenities").map(a => a.toString()).filter(Boolean)
    const categoryId = formData.get("categoryId")?.toString() || ""
    const status = formData.get("status")?.toString() || "AVAILABLE"
    const isActive = formData.get("isActive") === "true"
    const isFeatured = formData.get("isFeatured") === "true"
    const visibility = formData.get("visibility") as string || "public"
    const propertyProject = formData.get("propertyProject")?.toString() || null

    // Get current images info
    const currentMainImage = formData.get("currentMainImage")?.toString() || null
    const currentAdditionalImagesStr = formData.get("currentAdditionalImages")?.toString() || "[]"
    const currentAdditionalImages = JSON.parse(currentAdditionalImagesStr)
    const imagesToDeleteStr = formData.get("imagesToDelete")?.toString() || "[]"
    const imagesToDelete = JSON.parse(imagesToDeleteStr)

    console.log('Form data extracted:', {
      title,
      currentMainImage,
      currentAdditionalImages: currentAdditionalImages.length,
      imagesToDelete: imagesToDelete.length
    })

    // Validation
    if (!title || !categoryId || !address || !city) {
      const missing = []
      if (!title) missing.push('nosaukums')
      if (!categoryId) missing.push('kategorija')
      if (!address) missing.push('adrese')
      if (!city) missing.push('pilsēta')
      
      return NextResponse.json({ 
        error: `Nepieciešami lauki: ${missing.join(', ')}` 
      }, { status: 400 })
    }

    // Check if category exists
    const categoryExists = await prisma.propertyCategory.findUnique({
      where: { id: categoryId }
    })
    
    if (!categoryExists) {
      return NextResponse.json({ error: "Kategorija neeksistē" }, { status: 400 })
    }

    // Delete images from S3 that are marked for deletion
    for (const imageUrl of imagesToDelete) {
      try {
        await deleteImage(imageUrl)
        console.log('Deleted from S3:', imageUrl)
      } catch (error) {
        console.error('Failed to delete from S3:', imageUrl, error)
        // Continue even if deletion fails
      }
    }

    // Handle new main image
    let finalMainImage = currentMainImage
    const newMainImageFile = formData.get("mainImage") as File | null
    
    if (newMainImageFile && newMainImageFile.size > 0) {
      console.log('Uploading new main image to S3')
      
      // Check file size
      if (newMainImageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: "Galvenais attēls pārāk liels (max 10MB)" 
        }, { status: 413 })
      }
      
      try {
        const timestamp = Date.now()
        const propertySlug = createSlug(title)
        const publicId = `properties/${propertySlug}-${timestamp}-main`
        
        finalMainImage = await uploadToCloudinary(newMainImageFile, publicId)
        console.log('New main image uploaded:', finalMainImage)
        
        // Delete old main image if it exists and is different
        if (currentMainImage && currentMainImage !== finalMainImage) {
          try {
            await deleteImage(currentMainImage)
            console.log('Old main image deleted from S3')
          } catch (error) {
            console.error('Failed to delete old main image:', error)
          }
        }
      } catch (uploadError) {
        console.error('Failed to upload new main image:', uploadError)
        return NextResponse.json({ 
          error: "Neizdevās augšupielādēt galveno attēlu" 
        }, { status: 500 })
      }
    }

    // Handle new additional images
    const finalAdditionalImages = [...currentAdditionalImages]
    let imageIndex = 0
    
    while (true) {
      const additionalImageFile = formData.get(`additionalImage${imageIndex}`) as File | null
      if (!additionalImageFile || additionalImageFile.size === 0) break

      console.log(`Uploading additional image ${imageIndex + 1} to S3`)
      
      // Check file size
      if (additionalImageFile.size > 10 * 1024 * 1024) {
        return NextResponse.json({ 
          error: `Attēls ${imageIndex + 1} pārāk liels (max 10MB)` 
        }, { status: 413 })
      }

      try {
        const timestamp = Date.now()
        const propertySlug = createSlug(title)
        const publicId = `properties/${propertySlug}-${timestamp}-${imageIndex + 1}`
        
        const imageUrl = await uploadToCloudinary(additionalImageFile, publicId)
        finalAdditionalImages.push(imageUrl)
        console.log(`Additional image ${imageIndex + 1} uploaded:`, imageUrl)
      } catch (uploadError) {
        console.error(`Failed to upload additional image ${imageIndex + 1}:`, uploadError)
        // Continue with other images
      }
      
      imageIndex++
    }

    // Update property in database
    console.log('Updating property in database...')
    
    const propertyData = {
      title,
      description,
      price: Math.round(price * 100), // Convert to cents
      currency,
      address,
      city,
      district,
      rooms,
      area,
      floor,
      totalFloors,
      series,
      hasElevator,
      amenities,
      categoryId,
      status: status as PropertyStatus,
      visibility: visibility as PropertyVisibility,
      isActive,
      isFeatured,
      mainImage: finalMainImage,
      images: finalAdditionalImages,
      propertyProject,
      videoUrl
    }

    const property = await prisma.property.update({
      where: { id },
      data: propertyData,
      include: {
        category: true,
        agent: true
      }
    })

    console.log('✅ Property updated successfully:', property.id)
    return NextResponse.json(property)
    
  } catch (error) {
    console.error('❌ Error updating property:', error)
    return NextResponse.json({ error: "Kļūda atjauninot īpašumu" }, { status: 500 })
  }
}

// DELETE method for deleting property
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Get property to find associated images
    const property = await prisma.property.findUnique({
      where: { id }
    })

    if (!property) {
      return NextResponse.json({ error: "Īpašums nav atrasts" }, { status: 404 })
    }

    // Delete images from S3
    const imagesToDelete = []
    if (property.mainImage) imagesToDelete.push(property.mainImage)
    if (property.images) imagesToDelete.push(...property.images)

    for (const imageUrl of imagesToDelete) {
      try {
        await deleteImage(imageUrl)
        console.log('Deleted from S3:', imageUrl)
      } catch (error) {
        console.error('Failed to delete from S3:', imageUrl, error)
        // Continue even if deletion fails
      }
    }

    // Delete property from database
    await prisma.property.delete({
      where: { id }
    })

    return NextResponse.json({ success: true, message: "Īpašums dzēsts veiksmīgi" })
  } catch (error) {
    console.error('Error deleting property:', error)
    return NextResponse.json({ error: "Kļūda dzēšot īpašumu" }, { status: 500 })
  }
}