import { prisma } from "../db"

export async function getFooterSettings() {
  const data = await prisma.footerSettings.findFirst()
  return data
}