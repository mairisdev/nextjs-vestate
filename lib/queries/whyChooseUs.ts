import { prisma } from "@/lib/prisma"

export async function getWhyChooseUs() {
  const data = await prisma.whyChooseUs.findFirst()
  return data
}
