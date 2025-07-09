import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile, mkdir, unlink } from "fs/promises"
import path from "path"
import { PropertyStatus } from "@prisma/client"

// Helper funkcija slug izveidošanai
function createSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/ā/g, 'a').replace(/č/g, 'c').replace(/ē/g, 'e')
    .replace(/ģ/g, 'g').replace(/ī/g, 'i').replace(/ķ/g, 'k')
    .replace(/ļ/g, 'l').replace(/ņ/g, 'n').replace(/š/g, 's')
    .replace(/ū/g, 'u').replace(/ž/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        category: true,
        agent: true
      }
    })

    if (!property) {
      return NextResponse.json({ error: "Īpašums nav atrasts" }, { status: 404 })
    }

    return NextResponse.json(property)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda ielādējot īpašumu" }, { status: 500 })
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const contentType = req.headers.get("content-type")

    if (contentType?.includes("multipart/form-data")) {
      const formData = await req.formData()
      
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
      const propertyProject = formData.get("propertyProject")?.toString() || null

      // Iegūstam esošo īpašumu
      const existingProperty = await prisma.property.findUnique({
        where: { id }
      })

      if (!existingProperty) {
        return NextResponse.json({ error: "Īpašums nav atrasts" }, { status: 404 })
      }

      // Esošie attēli
      const currentMainImage = formData.get("currentMainImage")?.toString() || null
      const currentAdditionalImagesStr = formData.get("currentAdditionalImages")?.toString() || "[]"
      const currentAdditionalImages = JSON.parse(currentAdditionalImagesStr)
      
      // Attēli, kas jādzēš
      const imagesToDeleteStr = formData.get("imagesToDelete")?.toString() || "[]"
      const imagesToDelete = JSON.parse(imagesToDeleteStr)

      // Dzēšam attēlus no failu sistēmas
      for (const imagePath of imagesToDelete) {
        try {
          const fullPath = path.join(process.cwd(), "public/uploads/properties", imagePath)
          await unlink(fullPath)
        } catch (error) {
          console.error(`Error deleting image: ${imagePath}`, error)
        }
      }

      // Izveidojam mapas nosaukumu no title
      const folderName = createSlug(title)
      const uploadsDir = path.join(process.cwd(), "public/uploads/properties", folderName)

      // Izveidojam mapi, ja tā neeksistē
      try {
        await mkdir(uploadsDir, { recursive: true })
      } catch (error) {
        console.error("Error creating directory:", error)
      }

      let finalMainImage = currentMainImage
      const finalAdditionalImages = [...currentAdditionalImages]

      // Apstrādājam jauno galveno attēlu
      const newMainImageFile = formData.get("mainImage") as File | null
      if (newMainImageFile && newMainImageFile.size > 0) {
        const ext = path.extname(newMainImageFile.name) || ".jpg"
        const fileName = `main-image${ext}`
        const filePath = path.join(uploadsDir, fileName)
        
        const buffer = Buffer.from(await newMainImageFile.arrayBuffer())
        await writeFile(filePath, buffer)
        
        finalMainImage = `${folderName}/${fileName}`
      }

      // Apstrādājam jaunos papildu attēlus
      let imageIndex = 0
      while (true) {
        const additionalImageFile = formData.get(`additionalImage${imageIndex}`) as File | null
        if (!additionalImageFile || additionalImageFile.size === 0) break

        const ext = path.extname(additionalImageFile.name) || ".jpg"
        const fileName = `additional-image-${Date.now()}-${imageIndex + 1}${ext}`
        const filePath = path.join(uploadsDir, fileName)
        
        const buffer = Buffer.from(await additionalImageFile.arrayBuffer())
        await writeFile(filePath, buffer)
        
        finalAdditionalImages.push(`${folderName}/${fileName}`)
        imageIndex++
      }

      // Atjauninām īpašumu datubāzē
      const property = await prisma.property.update({
        where: { id },
        data: {
          title,
          description,
          price: Math.round(price * 100),
          currency,
          address,
          city,
          district,
          videoUrl,
          rooms,
          area,
          floor,
          totalFloors,
          series,
          hasElevator,
          amenities,
          categoryId,
          status: status as PropertyStatus,
          isActive,
          isFeatured,
          mainImage: finalMainImage,
          images: finalAdditionalImages,
          propertyProject
        },
        include: {
          category: true,
          agent: true
        }
     })

     return NextResponse.json(property)
   } else {
     // JSON formāts (bez attēliem)
     const data = await req.json()
     
     const property = await prisma.property.update({
       where: { id },
       data: {
         title: data.title,
         description: data.description,
         price: Math.round((data.price || 0) * 100),
         currency: data.currency || "EUR",
         address: data.address,
         city: data.city,
         district: data.district || null,
         rooms: data.rooms || null,
         area: data.area || null,
         floor: data.floor || null,
         totalFloors: data.totalFloors || null,
         series: data.series || null,
         hasElevator: data.hasElevator || false,
         amenities: data.amenities || [],
         categoryId: data.categoryId,
         status: (data.status as PropertyStatus) || PropertyStatus.AVAILABLE,
         isActive: data.isActive !== undefined ? data.isActive : true,
         isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
         propertyProject: data.propertyProject || null
       },
       include: {
        category: true,
        agent: true
      }
     })

     return NextResponse.json(property)
   }
 } catch (error) {
   console.error("Error updating property:", error)
   return NextResponse.json({ error: "Kļūda atjauninot īpašumu" }, { status: 500 })
 }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
 try {
   const { id } = await params
   
   // Iegūstam īpašumu ar attēliem
   const property = await prisma.property.findUnique({
     where: { id }
   })

   if (!property) {
     return NextResponse.json({ error: "Īpašums nav atrasts" }, { status: 404 })
   }

   // Dzēšam visus attēlus
   const allImages = [property.mainImage, ...property.images].filter(Boolean)
   
   for (const imagePath of allImages) {
     try {
       const fullPath = path.join(process.cwd(), "public/uploads/properties", imagePath as string)
       await unlink(fullPath)
     } catch (error) {
       console.error(`Error deleting image: ${imagePath}`, error)
     }
   }

   // Dzēšam īpašumu no datubāzes
   await prisma.property.delete({
     where: { id }
   })
   
   return NextResponse.json({ success: true })
 } catch (error) {
   console.error("Error deleting property:", error)
   return NextResponse.json({ error: "Kļūda dzēšot īpašumu" }, { status: 500 })
 }
}