import { prisma } from "@/lib/prisma"

export async function getSlides() {
  const slides = await prisma.slide.findMany({
    orderBy: { order: "asc" },
  })

  return slides
}