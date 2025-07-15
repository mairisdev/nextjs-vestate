import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const category = searchParams.get("category")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 12

  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    visibility: 'private'
  }

  if (category && category !== 'all') {
    where.category = { slug: category }
  }

  try {
    // Iegūstam privātos īpašumus, bet ar ierobežotu informāciju
    const properties = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        price: true,
        currency: true,
        address: true,
        city: true,
        rooms: true,
        area: true,
        mainImage: true,
        visibility: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        agent: {
          select: {
            firstName: true,
            lastName: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    const total = await prisma.property.count({ where })

    return NextResponse.json({
      properties,
      total,
      pages: Math.ceil(total / limit)
    })
  } catch (error) {
    console.error("Error fetching private properties preview:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
