import { prisma } from "../db"

export async function getSevenSection() {
  return await prisma.sevenSection.findFirst()
}
