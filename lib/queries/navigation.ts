import { prisma } from "../db"

export async function getNavigationSettings() {
  const data = await prisma.navigationSettings.findFirst()

  if (!data) return null

  return {
    ...data,
    menuItems: Array.isArray(data.menuItems) ? data.menuItems : [],
  }
}
