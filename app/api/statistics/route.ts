import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncStatsSectionTranslations } from "@/lib/translationSync"

export async function GET() {
  try {
    const stats = await prisma.statistic.findMany({
      orderBy: { order: "asc" }
    })
    return NextResponse.json(stats)
  } catch (error) {
    console.error("[STATISTICS_GET]", error)
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json()

    if (!Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid data format" }, { status: 400 })
    }

    // Clear and reinsert (simplest approach for reordering)
    await prisma.statistic.deleteMany()

    const createdStats = []
    for (let i = 0; i < data.length; i++) {
      const stat = data[i]
      const created = await prisma.statistic.create({
        data: {
          icon: stat.icon || "HelpCircle",
          value: stat.value || "",
          description: stat.description || "",
          order: i,
        }
      })
      createdStats.push(created)
    }

    // Automātiska tulkojumu sinhronizācija
    await syncStatsSectionTranslations(data)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[STATISTICS_POST]", error)
    return NextResponse.json({ error: "Failed to save statistics" }, { status: 500 })
  }
}
