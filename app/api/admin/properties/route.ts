import { auth } from "@clerk/nextjs/server"
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
        category: true,
        agent: true
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
    const session = await auth();
    const userId = session?.userId;
    const agent = await prisma.agent.findUnique({
      where: { clerkId: userId || "" }
    })

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
      const categoryId = formData.get("categoryId")?.toString() || ""
      const status = formData.get("status")?.toString() || "AVAILABLE"
      const isActive = formData.get("isActive") === "true"
      const isFeatured = formData.get("isFeatured") === "true"
      const propertyProject = formData.get("propertyProject")?.toString() || null

      if (!title || !categoryId || !address || !city) {
        return NextResponse.json({ 
          error: "Nepieciešami lauki: nosaukums, kategorija, adrese, pilsēta" 
        }, { status: 400 })
      }

      const folderName = createSlug(title)
      const uploadsDir = path.join(process.cwd(), "public/uploads/properties", folderName)

      await mkdir(uploadsDir, { recursive: true })

      let mainImagePath = null
      const additionalImagePaths: string[] = []

      const mainImageFile = formData.get("mainImage") as File | null
      if (mainImageFile && mainImageFile.size > 0) {
        const ext = path.extname(mainImageFile.name) || ".jpg"
        const fileName = `main-image${ext}`
        const filePath = path.join(uploadsDir, fileName)
        const buffer = Buffer.from(await mainImageFile.arrayBuffer())
        await writeFile(filePath, buffer)
        mainImagePath = `${folderName}/${fileName}`
      }

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

      const property = await prisma.property.create({
        data: {
          title,
          description,
          price: Math.round(price * 100),
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
          images: additionalImagePaths,
          propertyProject,
          videoUrl,
          agentId: agent?.id || null
        },
        include: {
          category: true,
          agent: true
        }
      })

      return NextResponse.json(property)
    } else {
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
          images: [],
          propertyProject: data.propertyProject || null,
          agentId: agent?.id || null
        },
        include: {
          category: true,
          agent: true
        }
      })

      return NextResponse.json(property)
    }
  } catch (error) {
    console.error("Error creating property:", error)
    return NextResponse.json({ error: "Kļūda izveidojot īpašumu" }, { status: 500 })
  }
}
