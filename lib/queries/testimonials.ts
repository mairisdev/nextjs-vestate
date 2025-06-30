import { prisma } from "../db"

export async function getTestimonials() {
  return await prisma.testimonial.findMany({
    orderBy: { createdAt: "desc" },
  })
}
