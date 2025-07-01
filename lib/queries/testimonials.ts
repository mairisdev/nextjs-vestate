import { prisma } from "@/lib/prisma"

export async function getTestimonials() {
  try {
    const testimonials = await prisma.testimonial.findMany({
      orderBy: { createdAt: "desc" }
    })
    return testimonials
  } catch (error) {
    console.error("Error fetching testimonials:", error)
    return []
  }
}
