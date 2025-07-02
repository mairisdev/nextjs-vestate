import { prisma } from "../db"

export async function getNavigationSettings() {
  const data = await prisma.navigationSettings.findFirst()

  if (!data) return null

  return {
    ...data,
    logoUrl: data.logoUrl ?? null,
    menuItems: Array.isArray(data.menuItems) ? data.menuItems : [],
  }
}
