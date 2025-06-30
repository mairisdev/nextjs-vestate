import { prisma } from "../db"

export async function getSixthSection() {
  return await prisma.sixthSection.findFirst()
}
