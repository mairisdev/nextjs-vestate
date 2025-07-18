import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get("email")
  const category = searchParams.get("category")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = 12

  if (!email) {
    return NextResponse.json({ error: "Nav norādīts e-pasts" }, { status: 400 })
  }

  // Pārbaudam vai lietotājam ir derīga piekļuve
  const access = await prisma.accessRequest.findFirst({
    where: {
      email,
      verified: true,
      validUntil: {
        gt: new Date(),
      },
    },
  })

  if (!access) {
    return NextResponse.json({ error: "Nav piekļuves vai beidzies termiņš" }, { status: 401 })
  }

  const skip = (page - 1) * limit
  
  const where: any = { 
    isActive: true,
    visibility: 'private'
  }

  if (category && category !== 'all') {
    where.category = { slug: category }
  }

  try {
    const properties = await prisma.property.findMany({
      where,
      include: {
        category: true,
        agent: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true
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
      pages: Math.ceil(total / limit),
      validUntil: access.validUntil?.toISOString() ?? null,
    })
  } catch (error) {
    console.error("Error fetching private properties:", error)
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}