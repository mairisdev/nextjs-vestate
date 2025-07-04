import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const categories = await prisma.propertyCategory.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: {
          select: { properties: true }
        }
      }
    })
    return NextResponse.json(categories)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda ielādējot kategorijas" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()
    
    const category = await prisma.propertyCategory.create({
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || "",
        isVisible: data.isVisible ?? true,
        order: data.order || 0
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    return NextResponse.json({ error: "Kļūda izveidojot kategoriju" }, { status: 500 })
  }
}
