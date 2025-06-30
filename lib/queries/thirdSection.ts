import { prisma } from "@/lib/prisma"

export async function getThirdSection() {
  try {
    const section = await prisma.thirdSection.findUnique({
      where: { id: "third-section" },
    })
    return section
  } catch (error) {
    console.error("Error loading third section:", error)
    return null
  }
}