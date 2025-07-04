import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { writeFile, mkdir } from "fs/promises"
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

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        category: true
      },
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(properties)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda ielādējot īpašumus" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
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
      const rooms = formData.get("rooms") ? parseInt(formData.get("rooms")?.toString() || "0") : null
      const area = formData.get("area") ? parseFloat(formData.get("area")?.toString() || "0") : null
      const floor = formData.get("floor") ? parseInt(formData.get("floor")?.toString() || "0") : null
      const totalFloors = formData.get("totalFloors") ? parseInt(formData.get("totalFloors")?.toString() || "0") : null
      const categoryId = formData.get("categoryId")?.toString() || ""
      const status = formData.get("status")?.toString() || "AVAILABLE"
      const isActive = formData.get("isActive") === "true"
      const isFeatured = formData.get("isFeatured") === "true"

      // Validācija
      if (!title || !categoryId || !address || !city) {
        return NextResponse.json({ 
          error: "Nepieciešami lauki: nosaukums, kategorija, adrese, pilsēta" 
        }, { status: 400 })
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

      let mainImagePath = null
      const additionalImagePaths: string[] = []

      // Apstrādājam galveno attēlu
      const mainImageFile = formData.get("mainImage") as File | null
      if (mainImageFile && mainImageFile.size > 0) {
        const ext = path.extname(mainImageFile.name) || ".jpg"
        const fileName = `main-image${ext}`
        const filePath = path.join(uploadsDir, fileName)
        
        const buffer = Buffer.from(await mainImageFile.arrayBuffer())
        await writeFile(filePath, buffer)
        
        mainImagePath = `${folderName}/${fileName}`
      }

      // Apstrādājam papildu attēlus
      let imageIndex = 0
      while (true) {
        const additionalImageFile = formData.get(`additionalImage${imageIndex}`) as File | null
        if (!additionalImageFile || additionalImageFile.size === 0) break

        const ext = path.extname(additionalImageFile.name) || ".jpg"
        const fileName = `additional-image-${imageIndex + 1}${ext}`
        const filePath = path.join(uploadsDir, fileName)
        
        const buffer = Buffer.from(await additionalImageFile.arrayBuffer())
        await writeFile(filePath, buffer)
        
        additionalImagePaths.push(`${folderName}/${fileName}`)
        imageIndex++
      }

      // Izveidojam īpašumu datubāzē
      const property = await prisma.property.create({
        data: {
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
          categoryId,
          status: status as PropertyStatus,
          isActive,
          isFeatured,
          mainImage: mainImagePath,
          images: additionalImagePaths
        },
        include: {
          category: true
        }
      })

      return NextResponse.json(property)
    } else {
      // JSON formāts (bez attēliem)
      const data = await req.json()
      
      const property = await prisma.property.create({
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
          categoryId: data.categoryId,
          status: (data.status as PropertyStatus) || PropertyStatus.AVAILABLE,
          isActive: data.isActive !== undefined ? data.isActive : true,
          isFeatured: data.isFeatured !== undefined ? data.isFeatured : false,
          mainImage: null,
          images: []
        },
        include: {
          category: true
        }
      })

      return NextResponse.json(property)
    }
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Kļūda izveidojot īpašumu" }, { status: 500 })
  }
}
