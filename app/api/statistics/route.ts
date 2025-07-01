import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const stats = await prisma.statistic.findMany({
    orderBy: { order: "asc" }
  })
  return NextResponse.json(stats)
}

export async function POST(req: NextRequest) {
  const data = await req.json()

  // Clear and reinsert (simplest approach for reordering)
  await prisma.statistic.deleteMany()

  for (let i = 0; i < data.length; i++) {
    const stat = data[i]
    await prisma.statistic.create({
      data: {
        icon: stat.icon,
        value: stat.value,
        description: stat.description,
        order: i,
      }
    })
  }

  return NextResponse.json({ success: true })
}
