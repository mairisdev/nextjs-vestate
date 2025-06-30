import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    console.error("[TESTIMONIALS_GET]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Delete all and re-insert for simplicity
    await prisma.testimonial.deleteMany()

    const created = await prisma.testimonial.createMany({
      data: data.testimonials,
    })

    return NextResponse.json(created)
  } catch (error) {
    console.error("[TESTIMONIALS_POST]", error)
    return new NextResponse("Server error", { status: 500 })
  }
}
