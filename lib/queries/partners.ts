import { prisma } from "@/lib/prisma"

export async function getPartnersSection() {
  return await prisma.partnersSection.findUnique({
    where: { id: "partners-section" },
  })
}
