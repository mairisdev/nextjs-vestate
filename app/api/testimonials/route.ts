import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { syncTestimonialsTranslations } from "@/lib/translationSync"

export async function GET() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" }
    })
    return NextResponse.json(testimonials)
  } catch (error) {
    return NextResponse.json({ message: "Server error", error }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { testimonials } = await req.json()

    if (!Array.isArray(testimonials)) {
      return NextResponse.json({ success: false, message: "Invalid data" }, { status: 400 })
    }

    // Dzēst visus
    await prisma.testimonial.deleteMany()

    // Saglabāt jaunos
    const createdTestimonials = await prisma.testimonial.createMany({
      data: testimonials.map((t) => ({
        name: t.name,
        message: t.message,
        rating: Number(t.rating),
        language: t.language,
      }))
    })

    // Automātiska tulkojumu sinhronizācija
    await syncTestimonialsTranslations(testimonials)

    return NextResponse.json({ success: true, message: "Saved successfully" })
  } catch (error) {
    console.error("Error saving testimonials:", error)
    return NextResponse.json({ success: false, message: "Error saving", error }, { status: 500 })
  }
}
