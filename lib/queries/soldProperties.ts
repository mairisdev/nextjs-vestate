import { prisma } from "../db"

export async function getSoldProperties() {
  return await prisma.soldProperty.findMany({
    orderBy: { createdAt: "desc" },
  })
}
