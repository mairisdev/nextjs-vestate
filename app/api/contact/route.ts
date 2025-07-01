import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const data = await prisma.contactSettings.findFirst()
    return NextResponse.json(data || {})
  } catch (error) {
    console.error("[CONTACT_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { heading, subtext, address, phone, email, hours } = await req.json()

    const existing = await prisma.contactSettings.findFirst()

    let result

    if (existing) {
      result = await prisma.contactSettings.update({
        where: { id: existing.id },
        data: { heading, subtext, address, phone, email, hours }
      })
    } else {
      result = await prisma.contactSettings.create({
        data: { heading, subtext, address, phone, email, hours }
      })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("[CONTACT_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
